package de.uni_passau.fim.dimis.rest2sparql.util;

import de.uni_passau.fim.dimis.rest2sparql.util.CubeObject;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 10:53 AM
 * To change this template use File | Settings | File Templates.
 */
public class Dimension extends CubeObject {

    protected String entityVarName;

    public Dimension(String label, String name) {
        super(label, name);
        this.entityVarName = "E_NAME";
        PREFIX = "D_";
    }

    @Override
    public String buildPattern(String obsNameVar) {
        return "?" + obsNameVar + " ?" + getVarName() + " ?" + entityVarName + ". ";
    }

    @Override
    public List<String> getAllVarNames() {
        List<String> retVal = super.getAllVarNames();
        retVal.add(entityVarName);
        return retVal;
    }

    public String getEntityVarName() {
        return entityVarName;
    }

    public void setEntityVarName(String entityVarName) {
        this.entityVarName = "E_" + entityVarName;
    }

    @Override
    public void setVarName(String varName) {
        super.setVarName(varName);
        setEntityVarName(varName);
    }
}
