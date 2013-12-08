package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.List;
import static de.uni_passau.fim.dimis.rest2sparql.util.Parameters.AggregateFunction;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 10:53 AM
 */
public class Dimension extends CubeObject {

    protected String entityVarName;
    private String entityLabelName;
    //private String entityLabelAggName;

    public Dimension(String name, Parameters p) {
        super(name, p);
        this.entityVarName = "E_NAME";
        this.entityLabelName = "L_NAME";
        //this.entityLabelAggName = "L_NAME_AGG";
        VAR_NAME_PREFIX = "D_";
    }

    public Dimension(String name) {
        super(name);
        this.entityVarName = "E_NAME";
        this.entityLabelName = "L_NAME";
        //this.entityLabelAggName = "L_NAME_AGG";
        VAR_NAME_PREFIX = "D_";
    }

    @Override
    public String buildPattern(String obsNameVar) {

        StringBuilder sb = new StringBuilder("?");
        sb.append(obsNameVar);
        sb.append(" ?");
        sb.append(getVarName());
        sb.append(" ?");
        sb.append(entityVarName);
        sb.append(". ");
        sb.append("?");
        sb.append(entityVarName);
        sb.append(" <http://www.w3.org/2000/01/rdf-schema#label> ?");
        sb.append(entityLabelName);
        sb.append(". ");

        return sb.toString();
    }

    @Override
    public String buildFilterString() {

        if (params != null && params.filterRelation != null && params.filterRelation != Parameters.Relation.NONE) {
            StringBuilder sb = new StringBuilder(super.buildFilterString());

            sb.append(FILTER_PREFIX);
            sb.append(entityLabelName);
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
    public String buildSelectToken() {

        if (params.aggregate == Parameters.AggregateFunction.NONE) {

            StringBuilder sb = new StringBuilder();

            // if group by this dimension, sample the entities and labels
            if (params.groupBy) {

                sb.append('?');
                sb.append(entityVarName);
                sb.append(' ');

                // sb.append(super.buildSelectTokenHelper(entityVarName, entityVarName + "_AGG", AggregateFunction.SAMPLE));
                sb.append(super.buildSelectTokenHelper(getVarName(), entityVarName + "_AGG", AggregateFunction.SAMPLE));
                sb.append(super.buildSelectTokenHelper(entityLabelName, entityLabelName + "_AGG", AggregateFunction.SAMPLE));
            }

            // generate normal select
            else {
                for (String s : this.getAllVarNames()) {
                    sb.append('?');
                    sb.append(s);
                    sb.append(' ');
                }
            }

            return sb.toString();
        } else {
            return super.buildSelectTokenHelper(getVarName(), getVarName() + "_AGG");
        }

    }

    @Override
    public String buildHavingToken() {
        return super.buildHavingTokenHelper(entityLabelName);
    }

    @Override
    public List<String> getAllVarNames() {
        List<String> retVal = super.getAllVarNames();
        retVal.add(entityVarName);
        retVal.add(entityLabelName);
        return retVal;
    }

    public String getEntityVarName() {
        return entityVarName;
    }

    public void setEntityVarName(String entityVarName) {
        this.entityVarName = "E_" + entityVarName;
    }

    public void setEntityLabelName(String entityLabelName) {
        this.entityLabelName = "L_" + entityLabelName;
        //this.entityLabelAggName = this.entityLabelName + "_AGG";
    }

    @Override
    public void setVarName(String varName, boolean usePrefix) {
        super.setVarName(varName, usePrefix);
        setEntityVarName(varName);
        setEntityLabelName(varName);
    }
}
