from django.db import models

class Instrument(models.Model):
    ticker = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=100)

class OHLC(models.Model):
    date = models.DateField()
    open = models.FloatField()
    high = models.FloatField()
    low = models.FloatField()
    close = models.FloatField()
    adj_close = models.FloatField()
    volume = models.FloatField()

    class Meta:
        abstract = True
        default_related_name='ohlc'

class Industry(models.Model):
    code = models.CharField(max_length=20, primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True)

class Stock(Instrument):
    insustry = models.ForeignKey(Industry, null=True, on_delete=models.SET_NULL, related_name='stocks')
    description = models.TextField(null=True)

class StockOHLC(OHLC):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
