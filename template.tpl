<%if(list.length > 0) {%>
    <ul>
        <%list.forEach(function(e, i) {%>
            <li data-id="<%=e.id%>"
                role="<%=e.isVIP ? 'vip' : ''%>">
                <%=e.name%> <%=i % 2 === 0 ? '(双数)' : '(单数)'%>
            </li>
        <%})%>
    </ul>
<%} else {%>
    <div class="null">无数据</div>
<%}%>