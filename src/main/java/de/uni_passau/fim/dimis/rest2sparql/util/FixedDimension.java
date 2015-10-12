package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * A {@link Dimension} that is fixed to a specific entity.
 */
public class FixedDimension extends Dimension {

    private List<String> entityNames = new ArrayList();

    public FixedDimension(String name, String entityName, Parameters p) {
        super(name, p);
        String[] entities = entityName.split(","); // Comma as separator
        this.entityNames.addAll(Arrays.asList(entities));
    }

    public FixedDimension(String name, String entityName) {
        super(name);
        String[] entities = entityName.split(",");
        this.entityNames.addAll(Arrays.asList(entities));
    }

    @Override
    public String buildFilterString() {

        return super.buildFilterString() + buildEntityFilterString();

    }

    public String buildEntityFilterString() {
        StringBuilder ret = new StringBuilder("FILTER (");
        ret.append("?");
        ret.append(entityVarName);
        ret.append(" = <");
        ret.append(entityNames.get(0));
        ret.append(">");

        // Add additional entities
        for (int i = 1; i < entityNames.size(); i++) {
            String name = entityNames.get(i);
            ret.append(" || ?");
            ret.append(entityVarName);
            ret.append(" = <");
            ret.append(entityNames.get(i));
            ret.append(">");
        }
        ret.append("). ");
        return ret.toString();
    }
}
