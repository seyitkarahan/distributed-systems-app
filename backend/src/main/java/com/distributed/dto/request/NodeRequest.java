package com.distributed.dto.request;

import com.distributed.entity.Node;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NodeRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Host is required")
    @Size(max = 255)
    private String host;

    @NotNull(message = "Port is required")
    @Positive(message = "Port must be positive")
    private Integer port;

    private Node.NodeStatus status;

    public Node.NodeStatus getStatus() {
        return status != null ? status : Node.NodeStatus.ACTIVE;
    }
}
