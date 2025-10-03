package com.company.emailpdf.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class MailboxLockingServiceTest {
    
    private MailboxLockingService lockingService;
    
    @BeforeEach
    void setUp() {
        lockingService = new MailboxLockingService();
    }
    
    @Test
    void tryAcquireLock_WithAvailableLock_ReturnsTrue() {
        String mailboxId = "test-mailbox-1";
        
        boolean acquired = lockingService.tryAcquireLock(mailboxId);
        
        assertTrue(acquired);
        assertTrue(lockingService.isMailboxLocked(mailboxId));
        
        lockingService.releaseLock(mailboxId);
    }
    
    @Test
    void tryAcquireLock_WhenAlreadyLocked_ReturnsFalse() throws InterruptedException {
        String mailboxId = "test-mailbox-2";
        AtomicBoolean secondAttemptResult = new AtomicBoolean(true);
        
        lockingService.tryAcquireLock(mailboxId);
        
        Thread otherThread = new Thread(() -> {
            boolean result = lockingService.tryAcquireLock(mailboxId, Duration.ofMillis(100));
            secondAttemptResult.set(result);
        });
        
        otherThread.start();
        otherThread.join();
        
        assertFalse(secondAttemptResult.get());
        
        lockingService.releaseLock(mailboxId);
    }
    
    @Test
    void releaseLock_AfterAcquiring_UnlocksMailbox() {
        String mailboxId = "test-mailbox-3";
        
        lockingService.tryAcquireLock(mailboxId);
        assertTrue(lockingService.isMailboxLocked(mailboxId));
        
        lockingService.releaseLock(mailboxId);
        assertFalse(lockingService.isMailboxLocked(mailboxId));
    }
    
    @Test
    void isMailboxLocked_WithoutLock_ReturnsFalse() {
        String mailboxId = "test-mailbox-4";
        
        boolean locked = lockingService.isMailboxLocked(mailboxId);
        
        assertFalse(locked);
    }
    
    @Test
    void getExecutionContext_WhenLocked_ReturnsContext() {
        String mailboxId = "test-mailbox-5";
        
        lockingService.tryAcquireLock(mailboxId);
        Optional<MailboxLockingService.ExecutionContext> context = lockingService.getExecutionContext(mailboxId);
        
        assertTrue(context.isPresent());
        assertEquals(mailboxId, context.get().getMailboxId());
        assertNotNull(context.get().getThreadName());
        assertNotNull(context.get().getStartTime());
        assertNotNull(context.get().getExecutionId());
        
        lockingService.releaseLock(mailboxId);
    }
    
    @Test
    void getExecutionContext_WhenNotLocked_ReturnsEmpty() {
        String mailboxId = "test-mailbox-6";
        
        Optional<MailboxLockingService.ExecutionContext> context = lockingService.getExecutionContext(mailboxId);
        
        assertTrue(context.isEmpty());
    }
    
    @Test
    void getLockedMailboxes_ReturnsAllLockedMailboxes() {
        lockingService.tryAcquireLock("mailbox-1");
        lockingService.tryAcquireLock("mailbox-2");
        lockingService.tryAcquireLock("mailbox-3");
        
        List<String> lockedMailboxes = lockingService.getLockedMailboxes();
        
        assertEquals(3, lockedMailboxes.size());
        assertTrue(lockedMailboxes.contains("mailbox-1"));
        assertTrue(lockedMailboxes.contains("mailbox-2"));
        assertTrue(lockedMailboxes.contains("mailbox-3"));
        
        lockingService.releaseLock("mailbox-1");
        lockingService.releaseLock("mailbox-2");
        lockingService.releaseLock("mailbox-3");
    }
    
    @Test
    void concurrentLockAttempts_OnlyOneSucceeds() throws InterruptedException {
        String mailboxId = "test-mailbox-concurrent";
        int threadCount = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);
        
        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    if (lockingService.tryAcquireLock(mailboxId, Duration.ofMillis(100))) {
                        successCount.incrementAndGet();
                        Thread.sleep(50);
                        lockingService.releaseLock(mailboxId);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneLatch.countDown();
                }
            });
        }
        
        startLatch.countDown();
        assertTrue(doneLatch.await(5, TimeUnit.SECONDS));
        
        assertEquals(1, successCount.get(), "Only one thread should acquire the lock");
        
        executor.shutdown();
        assertTrue(executor.awaitTermination(1, TimeUnit.SECONDS));
    }
    
    @Test
    void forceReleaseLock_WhenLocked_ReleasesSuccessfully() {
        String mailboxId = "test-mailbox-force";
        
        lockingService.tryAcquireLock(mailboxId);
        assertTrue(lockingService.isMailboxLocked(mailboxId));
        
        boolean released = lockingService.forceReleaseLock(mailboxId);
        
        assertTrue(released);
        assertFalse(lockingService.isMailboxLocked(mailboxId));
    }
    
    @Test
    void forceReleaseLock_WhenNotLocked_ReturnsFalse() {
        String mailboxId = "test-mailbox-force-2";
        
        boolean released = lockingService.forceReleaseLock(mailboxId);
        
        assertFalse(released);
    }
    
    @Test
    void executionContext_GetExecutionDuration_ReturnsPositiveDuration() throws InterruptedException {
        String mailboxId = "test-mailbox-duration";
        
        lockingService.tryAcquireLock(mailboxId);
        Thread.sleep(100);
        
        Optional<MailboxLockingService.ExecutionContext> context = lockingService.getExecutionContext(mailboxId);
        
        assertTrue(context.isPresent());
        Duration duration = context.get().getExecutionDuration();
        assertTrue(duration.toMillis() >= 100);
        
        lockingService.releaseLock(mailboxId);
    }
    
    @Test
    void multipleLockReleaseCycles_WorksCorrectly() {
        String mailboxId = "test-mailbox-cycles";
        
        for (int i = 0; i < 5; i++) {
            assertTrue(lockingService.tryAcquireLock(mailboxId));
            assertTrue(lockingService.isMailboxLocked(mailboxId));
            lockingService.releaseLock(mailboxId);
            assertFalse(lockingService.isMailboxLocked(mailboxId));
        }
    }
    
    @Test
    void differentMailboxes_CanBeLocked_Independently() {
        String mailbox1 = "mailbox-1";
        String mailbox2 = "mailbox-2";
        
        assertTrue(lockingService.tryAcquireLock(mailbox1));
        assertTrue(lockingService.tryAcquireLock(mailbox2));
        
        assertTrue(lockingService.isMailboxLocked(mailbox1));
        assertTrue(lockingService.isMailboxLocked(mailbox2));
        
        lockingService.releaseLock(mailbox1);
        lockingService.releaseLock(mailbox2);
    }
}
