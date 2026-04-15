package br.com.streamplatform.stream.controller;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.profile.dto.StreamAccountSummaryResponse;
import br.com.streamplatform.stream.dto.CreateStreamAccountRequest;
import br.com.streamplatform.stream.service.StreamAccountService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.NO_CONTENT;

@RestController
@RequestMapping("/api/stream-accounts")
public class StreamAccountController {

    private final StreamAccountService streamAccountService;

    public StreamAccountController(StreamAccountService streamAccountService) {
        this.streamAccountService = streamAccountService;
    }

    @GetMapping
    public List<StreamAccountSummaryResponse> list(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return streamAccountService.listCurrentUserAccounts(authenticatedUser.getId());
    }

    @PostMapping
    @ResponseStatus(CREATED)
    public StreamAccountSummaryResponse add(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateStreamAccountRequest request
    ) {
        return streamAccountService.addCurrentUserAccount(authenticatedUser.getId(), request);
    }

    @DeleteMapping("/{accountId}")
    @ResponseStatus(NO_CONTENT)
    public void remove(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID accountId
    ) {
        streamAccountService.removeCurrentUserAccount(authenticatedUser.getId(), accountId);
    }
}
