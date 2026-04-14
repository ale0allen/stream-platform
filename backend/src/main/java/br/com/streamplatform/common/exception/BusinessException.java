package br.com.streamplatform.common.exception;

import org.springframework.http.HttpStatus;

import java.util.Arrays;

public class BusinessException extends RuntimeException {

    private final HttpStatus status;
    private final String messageKey;
    private final Object[] messageArguments;

    public BusinessException(HttpStatus status, String messageKey, Object... messageArguments) {
        super(messageKey);
        this.status = status;
        this.messageKey = messageKey;
        this.messageArguments = Arrays.copyOf(messageArguments, messageArguments.length);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getMessageArguments() {
        return Arrays.copyOf(messageArguments, messageArguments.length);
    }
}
