package com.distributed.dto.request;

import com.distributed.entity.Node;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeUpdateRequest {

    @Size(max = 100)
    private String name;

    @Size(max = 255)
    private String host;

    private Integer port;

    private Node.NodeStatus status;
}
