package br.com.streamplatform.audit.service;

import br.com.streamplatform.audit.model.AuditLog;
import br.com.streamplatform.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(UUID actorUserId, String action, String entityType, String entityId) {
        auditLogRepository.save(new AuditLog(actorUserId, action, entityType, entityId));
    }
}
