from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({"status": "API is running"})

def root(request):
    return JsonResponse({"message": "ETHPAY API is running"})
