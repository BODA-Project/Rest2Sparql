package de.uni_passau.fim.dimis.rest2sparql.rest;

import com.google.gson.Gson;
import de.uni_passau.fim.dimis.rest2sparql.merging.MergeService;
import de.uni_passau.fim.dimis.rest2sparql.merging.config.MergeConfig;
import java.io.IOException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for storage of a new merged cube.
 */
public class MergerServlet extends HttpServlet {

    public static final int CODE_OK = 200;
    public static final int CODE_BAD_REQ = 400;
    public static final int CODE_UNAUTHED = 401;
    public static final String MSG_UNAUTHED = "To access this resource, you have to provide an ID and a hash.\n"
            + "You can get your ID an the hash by using the getHash function and providing your mendeley username and password.\n\n"
            + "If you see this message but provided an ID and a hash one of it (or both) may be incorrect.";

    /**
     *
     * @param servletConfig
     * @throws ServletException
     */
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
        // TODO: init authorization?
        super.init();
    }

    /**
     * Forward the post request.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        handleRequest(request, response);

    }

    /**
     * Forward the get request.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        handleRequest(request, response);
    }

    /**
     * Handle the request and send the response back to the web application
     * after finishing merging.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void handleRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // Load central configuration from json
        Gson gson = new Gson();
        MergeConfig config = gson.fromJson(request.getParameter("config"), MergeConfig.class);

        // Merge and store the datasets
        MergeService ms = new MergeService();
        ms.merge(config); // TODO return success / fail / etc. value

        // TODO response handling...
    }

}