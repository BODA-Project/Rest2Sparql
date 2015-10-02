package de.uni_passau.fim.dimis.rest2sparql.rest;

import de.uni_passau.fim.dimis.rest2sparql.merging.Vocabulary;
import java.io.IOException;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet for disambiguation of given entity labels.
 */
public class DisambiguationServlet extends HttpServlet {

    private final static String PARAMETER_ENTITY = "entity";
    public static final int CODE_OK = 200;
    public static final int CODE_BAD_REQ = 400;

    /**
     *
     * @param servletConfig
     * @throws ServletException
     */
    @Override
    public void init(ServletConfig servletConfig) throws ServletException {
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
     * Handle the request and send the found resource as response back to the
     * web application.
     *
     * @param request
     * @param response
     * @throws ServletException
     * @throws IOException
     */
    private void handleRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");
        String entity = request.getParameter(PARAMETER_ENTITY);
        String result = getDisambiguation(entity);
        ServletOutputStream out = response.getOutputStream();
        out.print(result);
        out.flush();
        out.close();
    }

    /**
     *
     * @param label
     * @return
     * @throws IOException
     */
    public String getDisambiguation(String label) throws IOException {
        String result = "";

        // TODO: old code...
//        HttpClient client = HttpClients.createDefault();
//        HttpPost post = new HttpPost(Properties.getInstance().getDisambiguationServer()); // TODO https://github.com/dbpedia-spotlight/dbpedia-spotlight/wiki/Web-service or Dummy-Entities
//        post.setHeader("accept", "application/json");
//        post.setHeader("content-type", "application/json");
//        StringEntity stringEntity = null;
//        try {
//            stringEntity = new StringEntity(body);
//        } catch (UnsupportedEncodingException e) {
//            e.printStackTrace();
//        }
//        post.setEntity(stringEntity);
//        HttpResponse response = null;
//        try {
//            response = client.execute(post);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        HttpEntity entity = response.getEntity();
//        String result = "";
//        try {
//            result = IOUtils.toString(entity.getContent(), "UTF-8");
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//        try {
//            EntityUtils.consume(entity);
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
        // If not found, suggest "http://code-research.eu/resource/RESOURCE"
        result = (result == null || result.equals("")) ? Vocabulary.CODE_URI + label : result;
        result = Vocabulary.CODE_URI + label;
        return result;
    }

}
