package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 10:08 AM
 * To change this template use File | Settings | File Templates.
 */
public class FixedDimension extends Dimension {

    private String entityName;

    public FixedDimension(String label, String name, String entityName) {
        super(label, name);
        this.entityName = entityName;
    }

    public String buildEntityFilterString() {
        return "FILTER (?" + entityVarName + " = <" + entityName + ">). ";
    }
}
