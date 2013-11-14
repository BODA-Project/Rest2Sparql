package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 10:08 AM
 */
@Deprecated
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

    public String buildEntityFilterString() {
        return "FILTER (?" + entityVarName + " = <" + entityName + ">). ";
    }
}
