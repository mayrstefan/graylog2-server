/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
package org.graylog2.rest.models.system.cluster.responses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.auto.value.AutoValue;
import org.graylog.autovalue.WithBeanGetter;

import java.util.List;

@AutoValue
@WithBeanGetter
@JsonAutoDetect
public abstract class NodeSummaryList {
    @JsonProperty
    public abstract List<NodeSummary> nodes();
    @JsonProperty
    public abstract int total();

    @JsonCreator
    public static NodeSummaryList create(@JsonProperty("nodes") List<NodeSummary> nodes,
                                         @JsonProperty("total") int total) {
        return new AutoValue_NodeSummaryList(nodes, total);
    }

    public static NodeSummaryList create(List<NodeSummary> nodes) {
        return new AutoValue_NodeSummaryList(nodes, nodes.size());
    }
}
