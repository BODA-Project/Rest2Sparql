package de.uni_passau.fim.dimis.util;

import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/24/13
 * Time: 11:00 AM
 * To change this template use File | Settings | File Templates.
 */
public class Measure extends CubeObject {

    private String valueVarName;

    public Measure(String label, String name) {
        super(label, name);
        PREFIX = "M_";
        this.valueVarName = "V_NAME";
    }

    @Override
    public String buildPattern(String obsNameVar) {
        return "?" + obsNameVar + " ?" + getVarName() + " ?" + valueVarName + ". ";
    }

    @Override
    public List<String> getAllVarNames() {
        List<String> retVal = super.getAllVarNames();
        retVal.add(valueVarName);
        return retVal;
    }

    public String getValueVarName() {
        return valueVarName;
    }

    public void setValueVarName(String valueVarName) {
        this.valueVarName = "V_" + valueVarName;
    }

    @Override
    public void setVarName(String varName) {
        super.setVarName(varName);
        setValueVarName(varName);
    }
}
