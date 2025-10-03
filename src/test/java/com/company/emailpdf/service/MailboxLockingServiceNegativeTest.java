package com.company.emailpdf.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class MailboxLockingServiceNegativeTest {
    
    private MailboxLockingService lockingService;
    
    @BeforeEach
    void setUp() {
        lockingService = new MailboxLockingService();
    }
    
    @Test
    void releaseLock_WithoutAcquiring_DoesNotThrowException() {
        String mailboxId = "never-locked";
        
        assertDoesNotThrow(() -> lockingService.releaseLock(mailboxId));
    }
    
    @Test
    void releaseLock_MultipleTimes_HandlesSafely() {
        String mailboxId = "multi-release";
        
        lockingService.tryAcquireLock(mailboxId);
        lockingService.releaseLock(mailboxId);
        
        assertDoesNotThrow(() -> lockingService.releaseLock(mailboxId));
        assertDoesNotThrow(() -> lockingService.releaseLock(mailboxId));
    }
    
    @Test
    void tryAcquireLock_WithVeryShortTimeout_ReturnsFalseQuickly() throws InterruptedException {
        String mailboxId = "short-timeout";
        
        lockingService.tryAcquireLock(mailboxId);
        
        Thread otherThread = new Thread(() -> {
            long startTime = System.currentTimeMillis();
            boolean acquired = lockingService.tryAcquireLock(mailboxId, Duration.ofMillis(10));
            long duration = System.currentTimeMillis() - startTime;
            
            assertFalse(acquired);
            assertTrue(duration < 100);
        });
        
        otherThread.start();
        otherThread.join();
        
        lockingService.releaseLock(mailboxId);
    }
    
    @Test
    void forceReleaseLock_OnNeverLockedMailbox_ReturnsFalse() {
        String mailboxId = "never-existed";
        
        boolean result = lockingService.forceReleaseLock(mailboxId);
        
        assertFalse(result);
    }
    
    @Test
    void getExecutionContext_AfterRelease_ReturnsEmpty() {
        String mailboxId = "context-test";
        
        lockingService.tryAcquireLock(mailboxId);
        lockingService.releaseLock(mailboxId);
        
        assertTrue(lockingService.getExecutionContext(mailboxId).isEmpty());
    }
    
    @Test
    void isMailboxLocked_OnNeverSeenMailbox_ReturnsFalse() {
        boolean locked = lockingService.isMailboxLocked("never-seen-mailbox");
        
        assertFalse(locked);
    }
    
    @Test
    void getLockedMailboxes_AfterAllReleased_ReturnsEmpty() {
        lockingService.tryAcquireLock("mb1");
        lockingService.tryAcquireLock("mb2");
        
        lockingService.releaseLock("mb1");
        lockingService.releaseLock("mb2");
        
        assertTrue(lockingService.getLockedMailboxes().isEmpty());
    }
}
