package br.com.streamplatform.stream.repository;

import br.com.streamplatform.stream.model.StreamAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StreamAccountRepository extends JpaRepository<StreamAccount, UUID> {
}
