package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/23/13
 * Time: 5:37 PM
 */
public abstract class CubeObject {

    protected static final String FILTER_PREFIX = "FILTER (?";

    protected String VAR_NAME_PREFIX;
    private String name;
    private String varName = "P_VAR";
    private SparqlPrefix prefix = null;
    protected Parameters params;

    public CubeObject(String name, Parameters p) {
        this.name = name;
        this.params = p;
    }

    public CubeObject(String name) {
        this.name = name;
    }

    private CubeObject(String name, Parameters p, SparqlPrefix prefix) {
        this.name = name;
        this.params = p;
        this.prefix = prefix;
    }

    public abstract String buildPattern(String obsNameVar);

    public String buildFilterString() {

        StringBuilder sb = new StringBuilder(FILTER_PREFIX);

        if (prefix == null) {
            sb.append(varName);
            sb.append(" = <");
            sb.append(name);
            sb.append(">). ");
        } else {
            sb.append(varName);
            sb.append(" = <");
            sb.append(prefix.getAbbreviation());
            sb.append(":");
            sb.append(name);
            sb.append(">). ");
        }

        return sb.toString();
    }

    public abstract String buildSelectToken();

    public abstract String buildHavingToken();

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
    public void setVarName(String varName, boolean usePrefix) {
        if (usePrefix) {
            this.varName = VAR_NAME_PREFIX + varName;
        } else {
            this.varName = varName;
        }
    }

    public Parameters getParams() {
        return params;
    }

    protected String buildSelectTokenHelper(String varName, String varAggName) {

        StringBuilder sb = new StringBuilder("?");
        sb.append('(');
        sb.append(params.aggregate.name());
        sb.append("(?");
        sb.append(varName);
        sb.append(") AS ?");
        sb.append(varAggName);
        sb.append(") ");
        return sb.toString();

    }

    protected String buildHavingTokenHelper (String varName) {

        StringBuilder sb = new StringBuilder(params.havingAggregate.name());

        sb.append("(?");
        sb.append(varName);
        sb.append(") ");
        sb.append(params.havingRelation.sign);
        sb.append(' ');
        sb.append(params.havingValue);

        return sb.toString();

    }
}
