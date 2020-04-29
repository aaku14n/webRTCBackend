.<script src="https://www.artfut.com/static/tagtag.min.js?campaign_code={{app.params.constants.admitad.campaign_code}}" async onerror='var self = this;window.ADMITAD=window.ADMITAD||{},ADMITAD.Helpers=ADMITAD.Helpers||{},ADMITAD.Helpers.generateDomains=function(){for(var e=new Date,n=Math.floor(new Date(2020,e.getMonth(),e.getDate()).setUTCHours(0,0,0,0)/1e3),t=parseInt(1e12*(Math.sin(n)+1)).toString(30),i=["de"],o=[],a=0;a<i.length;++a)o.push({domain:t+"."+i[a],name:t});return o},ADMITAD.Helpers.findTodaysDomain=function(e){function n(){var o=new XMLHttpRequest,a=i[t].domain,D="https://"+a+"/";o.open("HEAD",D,!0),o.onload=function(){setTimeout(e,0,i[t])},o.onerror=function(){++t<i.length?setTimeout(n,0):setTimeout(e,0,void 0)},o.send()}var t=0,i=ADMITAD.Helpers.generateDomains();n()},window.ADMITAD=window.ADMITAD||{},ADMITAD.Helpers.findTodaysDomain(function(e){if(window.ADMITAD.dynamic=e,window.ADMITAD.dynamic){var n=function(){return function(){return self.src?self:""}}(),t=n(),i=(/campaign_code=([^&]+)/.exec(t.src)||[])[1]||"";t.parentNode.removeChild(t);var o=document.getElementsByTagName("head")[0],a=document.createElement("script");a.src="https://www."+window.ADMITAD.dynamic.domain+"/static/"+window.ADMITAD.dynamic.name.slice(1)+window.ADMITAD.dynamic.name.slice(0,1)+".min.js?campaign_code="+i,o.appendChild(a)}});'></script>


{% if ((order.installments == 0) or ((order.installments == 1) and (order.orderInstallment|length == 1))) %}
    <!-- Push order data to Admitad -->
    {% set orderProducts = {} %}
    {% for key,orderProduct in order.orderProduct %}
        {% set orderProducts = orderProducts|merge({(key) : {'product_id': orderProduct.product_id, 'product_price': orderProduct.pricing, 'product_quantity': orderProduct.quantity}}) %}
    {% endfor %}
    {% set admitadOrder = {
        id: order.id,
        currency: order.currency
    } %}
    <script type="text/javascript">
        var order = JSON.parse('{{admitadOrder|json_encode()|raw}}');
        var orderProducts = JSON.parse('{{orderProducts|json_encode()|raw}}');
        if(order) {
            ADMITAD = window.ADMITAD || {};
            ADMITAD.Invoice = ADMITAD.Invoice || {};
            ADMITAD.Invoice.broker = "adm";     // deduplication parameter (for Admitad by default)
            ADMITAD.Invoice.category = "1";     // action code (defined during integration)
            var orderedItem = [];               // temporary array for product items
            var i;
            for (i = 0; i < orderProducts.length; i++) {
                orderedItem.push({
                    Product: {
                        productID: orderProducts[i].product_id, // internal product ID (not more than 100 characters, the same as in your product feed)
                        category: '1',               // tariff code (defined during integration)
                        price: orderProducts[i].product_price,          // product price
                        priceCurrency: order.currency,        // currency code in the ISO-4217 alfa-3 format
                    },
                    orderQuantity: orderProducts[i].product_quantity,   // product quantity
                    additionalType: "sale"           // always sale
                });
            }
            ADMITAD.Invoice.referencesOrder = ADMITAD.Invoice.referencesOrder || [];
            ADMITAD.Invoice.referencesOrder.push({
                orderNumber: order.id, // internal order ID (not more than 100 characters)
                orderedItem: orderedItem
            });
        }
    </script>
{% endif %}
<!-- End Pushing order data to Admitad -->
    <!-- Google Code for Sale Conversion Page - Adwords Tracking -->
{% set payment_in_usd = order.total_amount %}
{% set payment_in_aed = payment_in_usd * app.params.currency_rate.aed %}
<script type="text/javascript">
    /* <![CDATA[ */
    var google_conversion_id = {{ app.params.constants.pixels.sale_conversion.google_conversion_id }};
    var google_conversion_language = "en";
    var google_conversion_format = "3";
    var google_conversion_color = "ffffff";
    var google_conversion_label = "{{ app.params.constants.pixels.sale_conversion.google_conversion_label }}";
    var google_conversion_value = {{ payment_in_aed }}; /* for each relevant confirmation page, this value will be different */
    var google_conversion_currency = "{{ app.params.constants.pixels.sale_conversion.google_conversion_currency }}";
    var google_remarketing_only = false;
    /* ]]> */
</script>
<script type="text/javascript" src="//www.googleadservices.com/pagead/conversion.js" style="display:none;">
</script>
<img src="https://shareasale.com/sale.cfm?amount={{ order.total_amount|round }}&tracking={{ order.id }}&transtype=sale&merchantID={{ app.params.constants.shareasale.merchant_id }}" width="1" height="1">
<img src="https://stats-bq.stylight.net/track/{{ app.params.constants.stylight_code }}/sl?oi={{ order.id }}&ta={{ order.total_amount|round }}&c={{ order.currency }}&ic={{ products|length }}" style="position:absolute; visibility:hidden">

<script type="text/javascript" style="display:none;">
    var item_list = [];
    var item_ids = [];
    {% for product in products %}
        item_list.push({item: '{{ product.id }}', price: {{ product.price_tlc }}, quantity: 1});
        item_ids.push("{{ product.id }}");
    {% endfor %}
    var send_tracking_data =1;
    var mm_order_id = "{{ order.id }}";
    var mm_total_amount = "{{ order.total_amount|round }}";
    var mm_order_currency = "{{ order.currency }}";
    var dataLayer = dataLayer || [];
    dataLayer.push({
        "amount": "{{ order.total_amount }}",
        "cart_amount": "{{ order.sub_total - order.voucher_amount }}",
        "subtotal": "{{ order.sub_total }}",
        "vaoucher_value": "{{ order.voucher_amount }}",
        "currency": "{{ order.currency }}",
        "order_id": "{{ order.id }}"
    });
</script>