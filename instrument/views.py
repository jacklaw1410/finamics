from django.http import HttpResponse, JsonResponse
from .models import Stock, StockOHLC

import datetime, simplejson as json

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            encoded_object = obj.strftime('%Y-%m-%d %H:%M:%S')
        elif isinstance(obj, datetime.date):
            encoded_object = obj.strftime('%Y-%m-%d')
        else:
            encoded_object =json.JSONEncoder.default(self, obj)
        return encoded_object

def get_stock_ohlc(request):
    tickers = request.GET.get('tickers')
    if tickers is None:
        tickers = []
    else:
        tickers = tickers.split(',')

    queryset = StockOHLC.objects.filter(stock_id__in=tickers)
    values = list(queryset.values('date', 'open', 'high', 'low', 'close', 'adj_close', 'volume'))

    json_dump = json.dumps(values, cls=DateTimeEncoder)
    # json_dump = serializers.serialize('json', queryset)
    return HttpResponse(json_dump, content_type='application/json')
