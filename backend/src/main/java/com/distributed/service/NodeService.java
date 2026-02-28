package com.distributed.service;

import com.distributed.dto.request.NodeRequest;
import com.distributed.dto.request.NodeUpdateRequest;
import com.distributed.dto.response.NodeResponse;
import com.distributed.entity.Node;
import com.distributed.exception.ResourceNotFoundException;
import com.distributed.repository.NodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NodeService {

    private final NodeRepository nodeRepository;

    @Transactional(readOnly = true)
    public List<NodeResponse> findAll() {
        return nodeRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NodeResponse findById(Long id) {
        Node node = nodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Node", "id", id));
        return toResponse(node);
    }

    @Transactional
    public NodeResponse create(NodeRequest request) {
        Node node = Node.builder()
                .name(request.getName())
                .host(request.getHost())
                .port(request.getPort())
                .status(request.getStatus())
                .build();
        node = nodeRepository.save(node);
        return toResponse(node);
    }

    @Transactional
    public NodeResponse update(Long id, NodeUpdateRequest request) {
        Node node = nodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Node", "id", id));

        if (request.getName() != null) node.setName(request.getName());
        if (request.getHost() != null) node.setHost(request.getHost());
        if (request.getPort() != null) node.setPort(request.getPort());
        if (request.getStatus() != null) node.setStatus(request.getStatus());

        node = nodeRepository.save(node);
        return toResponse(node);
    }

    @Transactional
    public void deleteById(Long id) {
        if (!nodeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Node", "id", id);
        }
        nodeRepository.deleteById(id);
    }

    private NodeResponse toResponse(Node node) {
        return NodeResponse.builder()
                .id(node.getId())
                .name(node.getName())
                .host(node.getHost())
                .port(node.getPort())
                .status(node.getStatus())
                .createdAt(node.getCreatedAt())
                .updatedAt(node.getUpdatedAt())
                .build();
    }
}
