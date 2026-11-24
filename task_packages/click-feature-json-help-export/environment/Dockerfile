FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    python3-pip \
    python3-venv \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN git clone https://github.com/pallets/click.git /app \
    && git checkout 934813e4d421071a1b3db3973c02fe2721359a6e

RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"
RUN pip install --no-cache-dir -e . && pip install --no-cache-dir pytest==8.2.2
