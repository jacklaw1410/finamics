from django.http import HttpResponse
from django.shortcuts import render

from instrument.models import Stock

def index(request):
    stocks = Stock.objects.all()[:6]
    tickers = ','.join([stock.ticker for stock in stocks])

    context = {
        'stocks': stocks,
        'tickers': tickers,
    }
    return render(request, 'index.html', context)
