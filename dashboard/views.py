from django.http import HttpResponse
from django.shortcuts import render

from instrument import Stock

def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")
