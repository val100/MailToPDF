package com.company.emailpdf.exception;

public class SchedulingException extends RuntimeException {
    public SchedulingException(String message) {
        super(message);
    }
    
    public SchedulingException(String message, Throwable cause) {
        super(message, cause);
    }
}

class InvalidCronExpressionException extends RuntimeException {
    public InvalidCronExpressionException(String message, Throwable cause) {
        super(message, cause);
    }
}

class ScheduleNotFoundException extends RuntimeException {
    public ScheduleNotFoundException(String message) {
        super(message);
    }
}

class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}

class InternalServerException extends RuntimeException {
    public InternalServerException(String message) {
        super(message);
    }
}

class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}

class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}

class MailboxLockException extends RuntimeException {
    public MailboxLockException(String message) {
        super(message);
    }
}