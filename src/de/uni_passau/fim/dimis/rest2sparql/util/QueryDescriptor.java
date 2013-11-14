package de.uni_passau.fim.dimis.rest2sparql.util;

import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 11/6/13
 * Time: 1:16 PM
 * To change this template use File | Settings | File Templates.
 */
public class QueryDescriptor {

    private List<CubeObject> cubeObjects;
    private int limit = -1;

    public QueryDescriptor(List<CubeObject> objects) {
        this.cubeObjects = objects;
    }

    public QueryDescriptor(List<CubeObject> objects, int limit) {
        this.cubeObjects = objects;
        this.limit = limit;
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
                for (String s : co.getAllVarNames()) {
                    sb.append('?');
                    sb.append(s);
                    sb.append(' ');
                }
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
            if (co instanceof FixedDimension) {
                sb.append(((FixedDimension) co).buildEntityFilterString());
            }
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

    public List<Cube> getCubes() {
        LinkedList<Cube> cubes = new LinkedList<>();

        for (CubeObject co : cubeObjects) {
            if (co instanceof Cube) {
                cubes.add((Cube) co);
            }
        }

        return cubes;
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

    /**
     * Returns the number of {@link CubeObject} where instanceof {@link Cube} is true. <b>Complexity: O(n)</b>
     *
     * @return the number of {@link CubeObject} where instanceof {@link Cube} is true.
     */
    public int getNofCubes() {
        int i = 0;
        for (CubeObject co : cubeObjects) {
            if (co instanceof Cube) {
                i++;
            }
        }
        return i;
    }
}

