package com.distributed.dto.response;

import com.distributed.entity.Node;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeResponse {

    private Long id;
    private String name;
    private String host;
    private Integer port;
    private Node.NodeStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
