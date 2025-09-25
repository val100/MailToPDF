package com.company.emailpdf.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;

@Service
public class MailboxLockingService {
    
    private static final Logger log = LoggerFactory.getLogger(MailboxLockingService.class);
    
    private final ConcurrentHashMap<String, ReentrantLock> mailboxLocks = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ExecutionContext> activeExecutions = new ConcurrentHashMap<>();
    
    /**
     * Try to acquire exclusive lock for mailbox processing
     */
    public boolean tryAcquireLock(String mailboxId) {
        return tryAcquireLock(mailboxId, Duration.ofSeconds(5));
    }
    
    public boolean tryAcquireLock(String mailboxId, Duration timeout) {
        ReentrantLock lock = mailboxLocks.computeIfAbsent(mailboxId, k -> new ReentrantLock());
        
        try {
            boolean acquired = lock.tryLock(timeout.toSeconds(), TimeUnit.SECONDS);
            
            if (acquired) {
                // Record execution context
                ExecutionContext context = new ExecutionContext(
                    mailboxId, 
                    Thread.currentThread().getName(), 
                    LocalDateTime.now()
                );
                
                activeExecutions.put(mailboxId, context);
                
                log.debug("Acquired lock for mailbox: {} by thread: {}", mailboxId, context.getThreadName());
                return true;
            } else {
                log.warn("Failed to acquire lock for mailbox: {} within timeout: {}", mailboxId, timeout);
                return false;
            }
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Interrupted while trying to acquire lock for mailbox: {}", mailboxId);
            return false;
        }
    }
    
    /**
     * Release lock for mailbox
     */
    public void releaseLock(String mailboxId) {
        ReentrantLock lock = mailboxLocks.get(mailboxId);
        if (lock != null && lock.isHeldByCurrentThread()) {
            try {
                activeExecutions.remove(mailboxId);
                lock.unlock();
                log.debug("Released lock for mailbox: {}", mailboxId);
            } catch (Exception e) {
                log.error("Error releasing lock for mailbox: {}", mailboxId, e);
            }
        }
    }
    
    /**
     * Check if mailbox is currently being processed
     */
    public boolean isMailboxLocked(String mailboxId) {
        ReentrantLock lock = mailboxLocks.get(mailboxId);
        return lock != null && lock.isLocked();
    }
    
    /**
     * Get current execution context for mailbox
     */
    public Optional<ExecutionContext> getExecutionContext(String mailboxId) {
        return Optional.ofNullable(activeExecutions.get(mailboxId));
    }
    
    /**
     * Get all currently locked mailboxes
     */
    public List<String> getLockedMailboxes() {
        return mailboxLocks.entrySet().stream()
            .filter(entry -> entry.getValue().isLocked())
            .map(java.util.Map.Entry::getKey)
            .collect(Collectors.toList());
    }
    
    /**
     * Force release lock (admin operation)
     */
    public boolean forceReleaseLock(String mailboxId) {
        ReentrantLock lock = mailboxLocks.get(mailboxId);
        if (lock != null && lock.isLocked()) {
            try {
                activeExecutions.remove(mailboxId);
                lock.unlock();
                log.warn("Force released lock for mailbox: {}", mailboxId);
                return true;
            } catch (Exception e) {
                log.error("Failed to force release lock for mailbox: {}", mailboxId, e);
                return false;
            }
        }
        return false;
    }
    
    public static class ExecutionContext {
        private final String mailboxId;
        private final String threadName;
        private final LocalDateTime startTime;
        private final String executionId;
        
        public ExecutionContext(String mailboxId, String threadName, LocalDateTime startTime) {
            this.mailboxId = mailboxId;
            this.threadName = threadName;
            this.startTime = startTime;
            this.executionId = java.util.UUID.randomUUID().toString().substring(0, 8);
        }
        
        public Duration getExecutionDuration() {
            return Duration.between(startTime, LocalDateTime.now());
        }
        
        // Getters
        public String getMailboxId() { return mailboxId; }
        public String getThreadName() { return threadName; }
        public LocalDateTime getStartTime() { return startTime; }
        public String getExecutionId() { return executionId; }
    }
}