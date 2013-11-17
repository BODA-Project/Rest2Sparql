package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * A {@link Dimension} that is fixed to a specific entity.
 */
public class FixedDimension extends Dimension {

    private String entityName;

    public FixedDimension(String name, String entityName, Parameters p) {
        super(name, p);
        this.entityName = entityName;
    }

    public FixedDimension(String name, String entityName) {
        super(name);
        this.entityName = entityName;
    }

    @Override
    public String buildFilterString() {

        return super.buildFilterString() + buildEntityFilterString();

    }

    public String buildEntityFilterString() {
        return "FILTER (?" + entityVarName + " = <" + entityName + ">). ";
    }
}
