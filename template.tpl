<%
    function getRand() {
        return Math.random()*1000 | 0;
    }
%>

<%if(list.length > 0) {%>
    <ul>
        <%list.forEach(function(e, i) {%>
            <li data-rand="<%=getRand()%>"
                role="<%=e.isVIP ? 'vip' : ''%>">
                <%=e.id + '.' + e.name%>
                <%-i % 2 === 0 ? '(双数)' : '(单数)'%>
            </li>
        <%})%>
    </ul>
<%} else {%>
    <div class="null">无数据</div>
<%}%>