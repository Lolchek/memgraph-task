CONTAINER_ID=$(sudo docker ps | grep memgraph | cut -f 1 -d " ")
HOST=$(sudo docker inspect -f '' $CONTAINER_ID | grep \"IPAddress\" | head -n 1 | cut -f 2 -d ":" | cut -f 2 -d '"')
sudo docker run -it --entrypoint=mg_client memgraph --host $HOST