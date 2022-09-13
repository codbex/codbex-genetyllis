# codbex-genetyllis-platform

The `codbex` `genetyllis` platform package

To build the docker image:

    docker build -t codbex-genetyllis-keycloack-runtime:latest .

To run a container:
odbe
    docker run --name genetyllis --rm -p 8080:8080 -p 8081:8081 codbex-genetyllis-keycloack-runtime:latest
    
To stop the container:

    docker stop genetyllis

To tag the image:

    docker tag codbex-genetyllis-keycloack-runtime ghcr.io/codbex/codbex-genetyllis-keycloack-runtime:latest

To push to JFrog Container Registry:

    docker push ghcr.io/codbex/codbex-genetyllis-keycloack-runtime:latest

To pull from JFrog Container Registry:

    docker pull ghcr.io/codbex/codbex-genetyllis-keycloack-runtime:latest
