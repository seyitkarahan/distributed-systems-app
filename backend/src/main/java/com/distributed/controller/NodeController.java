package com.distributed.controller;

import com.distributed.dto.request.NodeRequest;
import com.distributed.dto.request.NodeUpdateRequest;
import com.distributed.dto.response.NodeResponse;
import com.distributed.service.NodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
@Tag(name = "Node", description = "Dağıtık sistem node'ları CRUD API")
public class NodeController {

    private final NodeService nodeService;

    @GetMapping
    @Operation(summary = "Tüm node'ları listele")
    public ResponseEntity<List<NodeResponse>> getAll() {
        return ResponseEntity.ok(nodeService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "ID ile node getir")
    public ResponseEntity<NodeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(nodeService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Yeni node oluştur")
    public ResponseEntity<NodeResponse> create(@Valid @RequestBody NodeRequest request) {
        NodeResponse response = nodeService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Node güncelle")
    public ResponseEntity<NodeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody NodeUpdateRequest request) {
        return ResponseEntity.ok(nodeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Node sil")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        nodeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
