from django.http import HttpResponse
from django.shortcuts import render

from instrument.models import Stock

def index(request):
    return render(request, 'index.html')
