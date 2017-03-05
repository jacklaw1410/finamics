from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'stockohlc$', views.get_stock_ohlc),
]
