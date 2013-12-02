package de.uni_passau.fim.dimis.rest2sparql.queryfactory;

import de.uni_passau.fim.dimis.rest2sparql.util.*;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

/**
 * The {@link QueryDescriptor} encapsulates all Information about a query and provides methods to build parts of a SPARQL query.
 */
public class QueryDescriptor {

    private List<CubeObject> cubeObjects;
    private int limit = -1;
    private int nofCubes = 0, nofDimensions = 0, nofMeasures = 0;
    private List<Cube> cubes = new LinkedList<>();
    private List<Dimension> dimensions = new LinkedList<>();
    private List<Measure> measures = new LinkedList<>();
    private boolean isGrouped = false;

    public QueryDescriptor(List<CubeObject> objects) {
        this.cubeObjects = objects;
        init();
    }

    public QueryDescriptor(List<CubeObject> objects, int limit) {
        this.cubeObjects = objects;
        this.limit = limit;
        init();
    }

    private void init() {

        for (CubeObject co : cubeObjects) {
            if (co instanceof Cube) {
                cubes.add((Cube) co);
                nofCubes++;
            } else if (co instanceof Dimension) {
                dimensions.add((Dimension) co);
                nofDimensions++;
            } else if (co instanceof Measure) {
                measures.add((Measure) co);
                nofMeasures++;
            }

            if (co.params.groupBy) {
                isGrouped = true;
            }
        }

    }

    /**
     * Builds a LIMIT statement to append to the SPARQL query.
     *
     * @return The LIMIT statement or "" of no limit is set.
     */
    public String limitString() {
        return limit < 0 ? "" : "LIMIT " + limit;
    }

    /**
     * Builds a SELECT string to integrate in a SPARQL query. Prepends the "SELECT " statement.
     *
     * @return the SELECT string.
     */
    public String selectString() {
        StringBuilder sb = new StringBuilder("SELECT ");

        for (CubeObject co : cubeObjects) {
            if (co.getParams().select) {
                sb.append(co.buildSelectToken());
            }
        }

        return sb.toString();
    }

    /**
     * Builds a WHERE string to integrate in a SPARQL query. Does <b>NOT</b> add the "WHERE " statement or any brackets.
     *
     * @return the WHERE string.
     */
    public String whereString(String varName, boolean ommitCubes) {
        StringBuilder sb = new StringBuilder();

        for (CubeObject co : cubeObjects) {
            if (ommitCubes && !(co instanceof Cube)) {
                sb.append(co.buildPattern(varName));
            }
        }

        return sb.toString();
    }

    /**
     * Builds a FILTER string to integrate in a SPARQL query.
     *
     * @return the FILTER string.
     */
    public String filterString() {
        StringBuilder sb = new StringBuilder();

        for (CubeObject co : cubeObjects) {
            sb.append(co.buildFilterString());
        }

        return sb.toString();
    }

    /**
     * Builds an ORDER BY statement for a SPARQL query.
     *
     * @return The ORDER BY statement.
     */
    public String orderByString() {

        //
        // Bad hack, too lazy to implement mergesort
        //

        LinkedList<CubeObject> lst = new LinkedList<>();
        StringBuilder sb = new StringBuilder("ORDER BY ");
        boolean somethingAdded = false;

        for (CubeObject co : cubeObjects) {
            if (co.getParams().orderBy > 0) {
                somethingAdded = true;

                if (lst.size() == 0) {
                    lst.add(co);
                } else {

                    int i = 0;
                    boolean added = false;
                    for (CubeObject o : lst) {
                        if (co.getParams().orderBy <= o.getParams().orderBy) {
                            lst.add(i, co);
                            added = true;
                            break;
                        }
                        i++;
                    }
                    if (!added) {
                        lst.add(co);
                    }
                }
            }
        }

        for (CubeObject co : lst) {
            sb.append('?');
            sb.append(co.getVarName());
            sb.append(' ');
        }

        return somethingAdded ? sb.toString() : "";
    }

    /**
     * Builds a GROUP BY statement for a SPARQL query.
     *
     * @return The GROUP BY statement.
     */
    public String groupByString() {
        StringBuilder sb = new StringBuilder("GROUP BY ");
        boolean somethingAdded = false;

        for (CubeObject co : cubeObjects) {
            if (co.getParams().groupBy) {
                somethingAdded = true;

                sb.append('?');
                sb.append(co.getVarName());
                sb.append(' ');
            }
        }

        return somethingAdded ? sb.toString() : "";
    }

    /**
     * Builds a HAVING statement for a SPARQL query.
     * It can handle only one argument in the statement!
     *
     * @return the HAVING statement.
     */
    public String havingString() {

        CubeObject having = null;

        for (CubeObject c : cubeObjects) {
            if (c.params.havingAggregate != Parameters.AggregateFunction.NONE) {
                having = c;
                break;
            }
        }

        if (having != null) {
            return "HAVING(" + having.buildHavingToken() + ") ";
        } else {
            return "";
        }
    }

    /**
     * Generates names for the variables.
     */
    public void generateVarNames() {

        int i = 0;
        for (CubeObject c : cubeObjects) {
            c.setVarName("NAME_" + Integer.toString(i), true);
            i++;
        }

    }

    public List<Cube> getCubes() {
        return Collections.unmodifiableList(cubes);
    }

    public List<Dimension> getDimensions() {
        return Collections.unmodifiableList(dimensions);
    }

    @SuppressWarnings("unused")
    public List<Measure> getMeasures() {
        return Collections.unmodifiableList(measures);
    }

    /**
     * Returns the number of {@link CubeObject} where instanceof {@link Cube} is true.
     *
     * @return the number of {@link CubeObject} where instanceof {@link Cube} is true.
     */
    public int nofCubes() {
        return nofCubes;
    }

    /**
     * Returns the number of {@link CubeObject} where instanceof {@link Dimension} is true.
     *
     * @return the number of {@link CubeObject} where instanceof {@link Dimension} is true.
     */
    public int nofDimensions() {
        return nofDimensions;
    }

    /**
     * Returns the number of {@link CubeObject} where instanceof {@link Measure} is true.
     *
     * @return the number of {@link CubeObject} where instanceof {@link Measure} is true.
     */
    @SuppressWarnings("unused")
    public int nofMeasures() {
        return nofMeasures;
    }

    /**
     * Returns the number of objects in the {@link QueryDescriptor}.
     *
     * @return the number of objects in the {@link QueryDescriptor}.
     */
    public int size() {
        return cubeObjects.size();
    }

    /**
     * Returns <code>true</code> if a GROUP BY statement occurs in the query.
     *
     * @return <code>true</code> if a GROUP BY statement occurs in the query.
     */
    public boolean isGrouped() {
        return isGrouped;
    }
}