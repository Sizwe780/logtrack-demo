from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def create_trip(request):
    data = request.data
    print("Incoming trip data:", data)  # This will show in Railway logs
    # You can add validation and saving logic here
    
    return Response({"message": "Trip created"}, status=status.HTTP_201_CREATED)