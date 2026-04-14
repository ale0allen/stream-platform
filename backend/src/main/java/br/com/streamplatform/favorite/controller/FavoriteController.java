package br.com.streamplatform.favorite.controller;

import br.com.streamplatform.auth.model.AuthenticatedUser;
import br.com.streamplatform.favorite.dto.CreateFavoriteRequest;
import br.com.streamplatform.favorite.dto.FavoriteResponse;
import br.com.streamplatform.favorite.service.FavoriteService;
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
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public List<FavoriteResponse> list(@AuthenticationPrincipal AuthenticatedUser authenticatedUser) {
        return favoriteService.listFavorites(authenticatedUser.getId());
    }

    @PostMapping
    @ResponseStatus(CREATED)
    public FavoriteResponse add(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @Valid @RequestBody CreateFavoriteRequest request
    ) {
        return favoriteService.addFavorite(authenticatedUser.getId(), request);
    }

    @DeleteMapping("/{profileId}")
    @ResponseStatus(NO_CONTENT)
    public void remove(
            @AuthenticationPrincipal AuthenticatedUser authenticatedUser,
            @PathVariable UUID profileId
    ) {
        favoriteService.removeFavorite(authenticatedUser.getId(), profileId);
    }
}
