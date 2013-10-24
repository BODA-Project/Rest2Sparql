package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/23/13
 * Time: 5:37 PM
 * To change this template use File | Settings | File Templates.
 */
public abstract class CubeObject {

    private String label;
    private String name;
    private String varName = "P_VAR";

    protected String PREFIX;

    public CubeObject(String label, String name) {
        this.label = label;
        this.name = name;
    }

    public abstract String buildPattern(String obsNameVar);

    public String buildFilterString() {
        return "FILTER (" + "?" + varName + " = <" + name + ">). ";
    }

    public String getLabel() {
        return label;
    }

    public String getName() {
        return name;
    }

    public String getVarName() {
        return varName;
    }

    public List<String> getAllVarNames() {
        List<String> retVal = new LinkedList<>();
        retVal.add(varName);
        return retVal;
    }

    /**
     * Creates new variable names for the object.
     * The prefixes (e.g. "D_") are prepended here, so do not add them to the argument.
     *
     * @param varName The new name for the variable.
     */
    public void setVarName(String varName) {
        this.varName = PREFIX + varName;
    }

}
