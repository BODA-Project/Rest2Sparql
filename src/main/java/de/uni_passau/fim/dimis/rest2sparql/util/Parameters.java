package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 11/6/13
 * Time: 3:48 PM
 * <p/>
 * A container for parameter information about parts of a query.<p />
 * It is immuteable and all parameters can be directly accessed.
 */
public class Parameters {

    public final boolean select;
    public final int orderBy;
    public final boolean groupBy;
    public final AggregateFunction aggregate;
    public final Relation filterRelation;
    public final String filterValue;
    public final AggregateFunction havingAggregate;
    public final Relation havingRelation;
    public final String havingValue;

    /**
     * Creates a new {@link Parameters} object.
     *
     * @param select          Shall the {@link CubeObject} appear in the SELECT line?
     * @param orderBy         At which position should the {@link CubeObject} appear in the ORDER BY line? (<= 0 if it shall not appear)
     * @param groupBy         Shall the output be grouped by the {@link CubeObject}?
     * @param aggregate       The function to aggregate the output with.
     * @param filterRelation  The relation to use for filtering.
     * @param filterValue     The value to filter for.
     * @param havingAggregate The aggregation function to use in the having clause.
     * @param havingRelation  The relation to use in the having clause.
     * @param havingValue     The value in the having clause to filter for.
     */
    public Parameters(boolean select,
                      int orderBy,
                      boolean groupBy,
                      AggregateFunction aggregate,
                      Relation filterRelation,
                      String filterValue,
                      AggregateFunction havingAggregate,
                      Relation havingRelation,
                      String havingValue) {

        this.select = select;
        this.orderBy = orderBy;
        this.groupBy = groupBy;
        this.aggregate = aggregate;
        this.filterRelation = filterRelation;
        this.filterValue = filterValue;
        this.havingAggregate = havingAggregate;
        this.havingRelation = havingRelation;
        this.havingValue = havingValue;
    }

    /**
     * Use the {@link de.uni_passau.fim.dimis.rest2sparql.util.Parameters.AggregateFunction#name() name} function
     * to get a {@link String} for the SPARQL Query.
     */
    public enum AggregateFunction {
        COUNT,
        SUM,
        MIN,
        MAX,
        AVG,
        GROUP_CONCAT,
        SAMPLE,
        NONE


    }

    public enum Relation {
        SMALLER("<"),
        SMALLER_OR_EQUAL("<="),
        EQUAL("="),
        NOT_EQUAL("!="),
        BIGGER(">"),
        BIGGER_OR_EQUAL(">="),
        NONE("");
        public final String sign;

        Relation(String sign) {
            this.sign = sign;
        }
    }
}
