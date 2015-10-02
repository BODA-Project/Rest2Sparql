package de.uni_passau.fim.dimis.rest2sparql.util;

import static de.uni_passau.fim.dimis.rest2sparql.util.Parameters.AggregateFunction;
import static de.uni_passau.fim.dimis.rest2sparql.util.Parameters.Relation;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 11/8/13
 * Time: 1:26 PM
 * <p/>
 * A factory to build a {@link Parameters} bean.
 */
public class ParametersFactory {

    private boolean select = true;
    private int orderBy = -1;
    private boolean groupBy = false;
    private AggregateFunction aggregate = AggregateFunction.NONE;
    private Relation filterRelation = Relation.NONE;
    private String filterValue = "";
    private AggregateFunction havingAggregate = AggregateFunction.NONE;
    private Relation havingRelation = Relation.NONE;
    private String havingValue = "";

    /**
     * Build a new {@link Parameters} object.
     *
     * @return a {@link Parameters} object.
     */
    public Parameters buildParameters() {
        return new Parameters(select,
                orderBy,
                groupBy,
                aggregate,
                filterRelation,
                filterValue,
                havingAggregate,
                havingRelation,
                havingValue);
    }

    /**
     * Reset the values to default.
     */
    public void reset() {
        select = true;
        orderBy = -1;
        groupBy = false;
        aggregate = AggregateFunction.NONE;
        filterRelation = Relation.NONE;
        filterValue = "";
        havingAggregate = AggregateFunction.NONE;
        havingRelation = Relation.NONE;
        havingValue = "";
    }

    public void setSelect(boolean select) {
        this.select = select;
    }

    public void setOrderBy(int orderBy) {
        this.orderBy = orderBy;
    }

    public void setGroupBy(boolean groupBy) {
        this.groupBy = groupBy;
    }

    public void setAggregate(AggregateFunction aggregate) {
        this.aggregate = aggregate;
    }

    public void setFilterRelation(Relation filterRelation) {
        this.filterRelation = filterRelation;
    }

    public void setFilterValue(String filterValue) {
        this.filterValue = filterValue;
    }

    public void setHavingAggregate(AggregateFunction havingAggregate) {
        this.havingAggregate = havingAggregate;
    }

    public void setHavingRelation(Relation havingRelation) {
        this.havingRelation = havingRelation;
    }

    public void setHavingValue(String havingValue) {
        this.havingValue = havingValue;
    }
}
