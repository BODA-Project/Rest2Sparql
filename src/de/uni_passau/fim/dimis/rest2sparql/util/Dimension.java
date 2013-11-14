package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 10:53 AM
 */
public class Dimension extends CubeObject {

    protected String entityVarName;

    public Dimension(String name, Parameters p) {
        super(name, p);
        this.entityVarName = "E_NAME";
        VAR_NAME_PREFIX = "D_";
    }

    public Dimension(String name) {
        super(name);
        this.entityVarName = "E_NAME";
        VAR_NAME_PREFIX = "D_";
    }

    @Override
    public String buildPattern(String obsNameVar) {
        return "?" + obsNameVar + " ?" + getVarName() + " ?" + entityVarName + ". ";
    }

    @Override
    public String buildFilterString() {

        if (params != null && params.filterRelation != null && params.filterRelation != Parameters.Relation.NONE) {
            StringBuilder sb = new StringBuilder(super.buildFilterString());

            sb.append(FILTER_PREFIX);
            sb.append(entityVarName);
            sb.append(' ');
            sb.append(params.filterRelation.sign);
            sb.append(" \"");
            sb.append(params.filterValue);
            sb.append("\"). ");

            return sb.toString();
        } else {
            return super.buildFilterString();
        }

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
    public void setVarName(String varName, boolean usePrefix) {
        super.setVarName(varName, usePrefix);
        setEntityVarName(varName);
    }
}
