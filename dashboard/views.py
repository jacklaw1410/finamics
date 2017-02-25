from django.http import HttpResponse
from django.shortcuts import render

from instrument.models import Stock

def index(request):
    context = {
        'stocks': Stock.objects.all()[:6],
    }
    return render(request, 'index.html', context)
