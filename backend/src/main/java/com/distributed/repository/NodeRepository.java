package com.distributed.repository;

import com.distributed.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node, Long> {

    List<Node> findAllByStatus(Node.NodeStatus status);

    boolean existsByName(String name);
}
