package de.uni_passau.fim.dimis.rest2sparql.util;

/**
 * Created with IntelliJ IDEA.
 * User: tommy
 * Date: 10/23/13
 * Time: 2:04 PM
 * To change this template use File | Settings | File Templates.
 */
public class SparqlPrefix {

    private String prefix;
    private String url;

    private int hash;
    private String string;

    public SparqlPrefix(String prefix, String url) {
        this.prefix = prefix;
        this.url = url;

        this.hash = (new String(prefix + url)).hashCode();
        this.string = "PREFIX " + prefix + ": <" + url + ">";
    }

    public String getAbbreviation() {
        return prefix;
    }

    public String getUrl() {
        return url;
    }

    @Override
    public boolean equals(Object o) {
        if (o instanceof SparqlPrefix) {
            SparqlPrefix other = (SparqlPrefix) o;
            return other.url.equals(url) && other.prefix.equals(prefix);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return hash;
    }

    @Override
    public String toString() {
        return string;
    }
}
