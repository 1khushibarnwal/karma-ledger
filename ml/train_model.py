"""
KarmaLedger scoring model
-------------------------
Trains a lightweight logistic-regression model that maps a developer's public
GitHub activity features -> a 0-1 "reliability/quality" probability, which the
backend then scales to a 0-1000 Karma Score.

Why logistic regression and not a giant model? For a hackathon demo you want
something (a) fast to train, (b) fully explainable to judges ("here are the
5 features and their weights"), and (c) exportable as plain JSON so Node.js
can run inference with zero Python dependency at request time.

Features used (all derivable from the free GitHub REST API):
  1. commit_frequency   - avg commits/week over last 90 days (normalized 0-1)
  2. repo_diversity     - number of distinct languages used (normalized 0-1)
  3. project_depth      - avg commits per repo, rewards sustained work over
                          one-off "hello world" repos (normalized 0-1)
  4. community_signal   - log-scaled followers + stars received (normalized 0-1)
  5. consistency        - longest contribution streak in days (normalized 0-1)

Run: python train_model.py
Produces: weights.json (consumed by server/services/mlScorer.js)
"""

import json
import numpy as np

np.random.seed(42)

N = 4000  # synthetic training examples

def synth_dataset(n):
    # Simulate plausible feature distributions for real GitHub users
    commit_frequency = np.clip(np.random.exponential(0.3, n), 0, 1)
    repo_diversity   = np.clip(np.random.beta(2, 3, n), 0, 1)
    project_depth    = np.clip(np.random.exponential(0.25, n), 0, 1)
    community_signal = np.clip(np.random.exponential(0.2, n), 0, 1)
    consistency      = np.clip(np.random.beta(2, 4, n), 0, 1)

    X = np.stack([commit_frequency, repo_diversity, project_depth,
                   community_signal, consistency], axis=1)

    # Ground truth "reliability" is a weighted combination + noise, then
    # squashed through a sigmoid. Consistency and project_depth matter most
    # (sustained, real contribution beats one-off activity or vanity stats).
    true_weights = np.array([0.9, 0.6, 1.3, 0.5, 1.4])
    bias = -1.6
    z = X @ true_weights + bias + np.random.normal(0, 0.35, n)
    p = 1 / (1 + np.exp(-z))
    y = (p > 0.5).astype(int)
    return X, y

def train_logistic_regression(X, y, lr=0.1, epochs=3000):
    n, d = X.shape
    w = np.zeros(d)
    b = 0.0
    for _ in range(epochs):
        z = X @ w + b
        pred = 1 / (1 + np.exp(-z))
        grad_w = X.T @ (pred - y) / n
        grad_b = np.mean(pred - y)
        w -= lr * grad_w
        b -= lr * grad_b
    return w, b

def accuracy(X, y, w, b):
    pred = (1 / (1 + np.exp(-(X @ w + b)))) > 0.5
    return np.mean(pred == y)

if __name__ == "__main__":
    X, y = synth_dataset(N)
    split = int(N * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    w, b = train_logistic_regression(X_train, y_train)
    acc = accuracy(X_test, y_test, w, b)
    print(f"Test accuracy on held-out synthetic data: {acc:.3f}")

    weights = {
        "feature_order": [
            "commit_frequency", "repo_diversity", "project_depth",
            "community_signal", "consistency"
        ],
        "weights": w.tolist(),
        "bias": float(b),
        "test_accuracy": float(acc),
    }

    with open("weights.json", "w") as f:
        json.dump(weights, f, indent=2)

    print("Saved weights.json ->", weights)
