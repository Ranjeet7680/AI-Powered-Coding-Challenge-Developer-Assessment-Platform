"""
[Stanford X Coding Task Factory Academy] Deep Learning Course Catalog
21 Lectures, Structured Markdown Study Notes, Equations, Python Snippets,
21 After-Video Quizzes (20+ Mastery Quiz Bank), and 20-Question Proctored Final Exam.
Built from verified playlist PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU.
"""
from functools import lru_cache
from typing import Any, Dict, List, Optional

from .course_catalog_shared import (
    QuizSpecTuple,
    build_course_catalog,
    filter_quiz_bank_from_catalog,
    find_lesson_in_catalog,
    select_exam_questions_from_catalog,
)


DL_PLAYLIST_ID = "PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU"
DL_PLAYLIST_URL = f"https://www.youtube.com/playlist?list={DL_PLAYLIST_ID}"
DL_COURSE_ID = "course-stanford-ctf-dl-21"
DL_COURSE_TITLE = "[Stanford X Coding Task Factory Academy] Deep Learning"
DL_INSTRUCTOR = "Stanford CS229 (Andrew Ng) • Coding Task Factory Academy"
DL_THUMBNAIL_URL = "/thumbnails/stanford-ctf-dl-thumbnail.svg"

DL_MODULES: List[Dict[str, Any]] = [
    {
        "id": "dl-mod-1",
        "order": 1,
        "title": "Supervised Optimization, GLMs & Generative Classifiers",
        "description": "Build mathematically rigorous intuition for gradient descent, Normal Equations, exponential-family GLMs, GDA, and Naive Bayes smoothing.",
        "learning_objectives": [
            "Derive LMS & batch/stochastic gradient descent updates",
            "Compare parametric logistic regression with non-parametric LWR",
            "Unify Gaussian/Bernoulli/Multinomial models under Exponential Families",
        ],
        "key_topics": ["OLS & Gradient Descent", "Locally Weighted Regression", "GLMs & Softmax", "GDA & Laplace Naive Bayes"],
        "prerequisite_module_ids": [],
        "range": (1, 5),
    },
    {
        "id": "dl-mod-2",
        "order": 2,
        "title": "Margins, Kernels, Learning Theory & Ensembles",
        "description": "Master maximum-margin dual optimization, Mercer kernels, VC dimension generalization guarantees, and tree variance/bias ensembles.",
        "learning_objectives": [
            "Formulate functional vs geometric margins and Lagrangian SVM duals",
            "Design positive-semidefinite RBF & polynomial Mercer kernels",
            "Quantify Bias-Variance via VC bounds, Random Forests & Boosting",
        ],
        "key_topics": ["Max-Margin SVM", "Mercer Kernel Trick", "VC Theory & Bounds", "Bagging vs Boosting"],
        "prerequisite_module_ids": ["dl-mod-1"],
        "range": (6, 10),
    },
    {
        "id": "dl-mod-3",
        "order": 3,
        "title": "Deep Neural Networks, Backprop, EM, PCA & ICA",
        "description": "Engineer multi-layer neural networks, stabilize backpropagation gradients, debug real-world systems via error analysis, and master latent EM/PCA/ICA.",
        "learning_objectives": [
            "Prevent vanishing gradients via ReLU, He initialization & skip connections",
            "Run quantitative dev-set error analysis and ablation studies",
            "Derive ELBO via Jensen's Inequality for EM, Factor Analysis, PCA & ICA",
        ],
        "key_topics": ["Deep Neural Nets", "Backprop & Initialization", "Error Analysis", "EM, Factor Analysis, PCA & ICA"],
        "prerequisite_module_ids": ["dl-mod-2"],
        "range": (11, 16),
    },
    {
        "id": "dl-mod-4",
        "order": 4,
        "title": "Reinforcement Learning, MDPs, Control & Diagnostics",
        "description": "Solve discrete and continuous-state Markov Decision Processes with Value/Policy Iteration, Fitted Value Iteration, LQR Riccati control, and RL debugging.",
        "learning_objectives": [
            "Prove gamma-contraction convergence for Value & Policy Iteration",
            "Scale control to continuous state spaces using Fitted Value Iteration & LQR",
            "Isolate simulator bugs vs optimizer bugs vs reward misspecification",
        ],
        "key_topics": ["MDP Bellman Equations", "Continuous-State MDPs", "LQR Control", "RL Diagnostics"],
        "prerequisite_module_ids": ["dl-mod-3"],
        "range": (17, 21),
    },
]

DL_CAPSTONE_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "dl-cap-1",
        "module_id": "dl-mod-3",
        "title": "Capstone 1: Vectorized Multi-Layer Neural Engine & Backprop Autograd",
        "difficulty": "Advanced",
        "estimated_hours": 10,
        "summary": "Build a clean NumPy/PyTorch multi-layer classifier from scratch supporting Xavier/He initialization, ReLU/Softmax activations, L2 weight decay, mini-batch SGD, and gradient-norm telemetry.",
        "deliverables": [
            "Forward + backward vectorized layer classes with numerical gradient check",
            "Loss & accuracy comparison curves: Sigmoid vs ReLU + He initialization",
            "Dev-set error analysis matrix on misclassified hard examples",
        ],
        "starter_template": "import numpy as np\n\nclass LinearReLULayer:\n    def __init__(self, d_in: int, d_out: int):\n        self.W = np.random.randn(d_in, d_out) * np.sqrt(2.0 / d_in)\n        self.b = np.zeros((1, d_out))\n\n    def forward(self, X: np.ndarray) -> np.ndarray:\n        self.X = X\n        self.Z = X @ self.W + self.b\n        return np.maximum(0, self.Z)\n",
        "rubric": [
            {"criterion": "Mathematical Correctness & Grad Check", "max_points": 30},
            {"criterion": "Architecture & Initialization Stability", "max_points": 25},
            {"criterion": "Error Analysis & Ablation Benchmarks", "max_points": 25},
            {"criterion": "Code Clarity & Documentation", "max_points": 20},
        ],
    },
    {
        "id": "dl-cap-2",
        "module_id": "dl-mod-2",
        "title": "Capstone 2: Mercer Kernel SVM & Latent EM / ICA Signal Separator",
        "difficulty": "Intermediate",
        "estimated_hours": 8,
        "summary": "Combine RBF Kernel Support Vector decision boundaries with an unsupervised Gaussian Mixture EM solver and Cocktail-Party ICA separator in one unified scientific pipeline.",
        "deliverables": [
            "Custom Gram matrix kernel evaluator verifying PSD Mercer condition",
            "EM log-likelihood ELBO trace demonstrating monotonic ascent",
            "PCA whitening + FastICA unmixing recovery benchmark (SIR score)",
        ],
        "starter_template": "import numpy as np\n\ndef rbf_gram_matrix(X: np.ndarray, gamma: float = 0.5) -> np.ndarray:\n    sq_norms = np.sum(X ** 2, axis=1, keepdims=True)\n    dists = sq_norms + sq_norms.T - 2.0 * (X @ X.T)\n    return np.exp(-gamma * np.maximum(dists, 0.0))\n",
        "rubric": [
            {"criterion": "Kernel PSD Verification & Margin Analysis", "max_points": 30},
            {"criterion": "EM Convergence & Log-Likelihood Plot", "max_points": 30},
            {"criterion": "ICA Unmixing Quality & Evaluation", "max_points": 20},
            {"criterion": "Reproducibility & Repo Hygiene", "max_points": 20},
        ],
    },
    {
        "id": "dl-cap-3",
        "module_id": "dl-mod-4",
        "title": "Capstone 3: Continuous-State MDP Value Iteration & LQR Controller",
        "difficulty": "Advanced",
        "estimated_hours": 9,
        "summary": "Implement a physical dynamical control environment (inverted pendulum / cart-pole linearization), solve finite-horizon LQR via Riccati backward passes, and audit reward robustness.",
        "deliverables": [
            "Dynamics transition model (A_t, B_t) and quadratic cost formulation",
            "Riccati backward solver computing optimal linear feedback matrix L_t",
            "CS229 RL diagnostic audit separating optimizer vs reward misspecification",
        ],
        "starter_template": "import numpy as np\n\ndef lqr_step(A: np.ndarray, B: np.ndarray, Q: np.ndarray, R: np.ndarray, P_next: np.ndarray):\n    # Implement Riccati optimal gain L and cost-to-go update P\n    bt_p = B.T @ P_next\n    L = -np.linalg.solve(R + bt_p @ B, bt_p @ A)\n    return L\n",
        "rubric": [
            {"criterion": "Bellman / Riccati Mathematical Formulation", "max_points": 35},
            {"criterion": "Trajectory Stabilization & Simulation Metrics", "max_points": 25},
            {"criterion": "Reward & Simulator Diagnostic Audit", "max_points": 25},
            {"criterion": "Code Quality & Visualizations", "max_points": 15},
        ],
    },
]


# Exact per-lecture specifications aligned 1-to-1 with dl_playlist_data.json (orders 1..21)
DL_LESSON_QUIZ_SPECS: Dict[int, QuizSpecTuple] = {
    1: (
        "In Andrew Ng's Stanford CS229 Lecture 1 taxonomy, what distinguishes Supervised Learning from Unsupervised Learning?",
        [
            "Supervised learning maps inputs x to given ground-truth target labels y, whereas unsupervised learning discovers structure from unlabeled inputs alone",
            "Supervised learning only handles discrete categories while unsupervised learning only handles continuous targets",
            "Unsupervised learning requires backpropagation through labeled rewards",
            "Supervised learning cannot perform regression",
        ],
        0,
        "Training Set Formulations: $\\mathcal{D}_{\\text{sup}} = \\{(x^{(i)}, y^{(i)})\\}_{i=1}^m$",
        "Supervised tasks train against observed output labels y, whereas unsupervised methods uncover latent clusters, densities, or subspaces without labels.",
        "import numpy as np\nX = np.array([[1200, 3], [1850, 4]])  # area, bedrooms\ny = np.array([295000, 440000])       # ground-truth prices",
    ),
    2: (
        "Comparing Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Normal Equations for Ordinary Least Squares, when do Normal Equations become impractical?",
        [
            "When feature dimension n is very large (e.g., n > 20,000), because inverting X^T X costs O(n^3) time and O(n^2) memory",
            "Whenever the target variable y is continuous",
            "When the design matrix X has more rows m than columns n",
            "Because Gradient Descent does not require choosing features",
        ],
        0,
        "$\\theta^* = (X^T X)^{-1} X^T y$ vs Iterative Update $\\theta_j := \\theta_j - \\alpha \\frac{1}{m}\\sum_i (h_\\theta(x^{(i)}) - y^{(i)}) x_j^{(i)}$",
        "Computing $(X^T X)^{-1}$ scales cubically in feature count $n$; iterative gradient descent scales linearly per step and is strictly preferred for large $n$ or non-linear deep architectures.",
        "import numpy as np\n# Closed-form Normal Equation (small n)\ntheta = np.linalg.pinv(X.T @ X) @ X.T @ y",
    ),
    3: (
        "Why does Locally Weighted Regression (LOESS / LWR) qualify as a non-parametric algorithm while standard Logistic Regression is parametric?",
        [
            "LWR retains the entire training set at inference time to re-fit local weights w^{(i)} = exp(-||x - x^{(i)}||^2 / 2\\tau^2) around each query point",
            "LWR never uses a bandwidth parameter \\tau",
            "Logistic Regression stores every training vector inside its prediction rule",
            "LWR only optimizes binary cross-entropy loss",
        ],
        0,
        "$w^{(i)} = \\exp\\!\\left(-\\frac{\\|x^{(i)} - x\\|^2}{2\\tau^2}\\right), \\quad \\sigma(z) = \\frac{1}{1 + e^{-z}}$",
        "Non-parametric estimators keep growing in effective memory/computation with training set size $m$, while parametric logistic regression compresses data into a fixed-length vector $\\theta \\in \\mathbb{R}^{n+1}$.",
        "def lwr_weights(X_train, x_query, tau=0.5):\n    diff = X_train - x_query\n    return np.exp(-np.sum(diff ** 2, axis=1) / (2 * tau ** 2))",
    ),
    4: (
        "In Generalized Linear Models (GLMs), why do Linear Regression (Gaussian), Logistic Regression (Bernoulli), and Softmax Regression (Multinomial) share the same gradient update template $\\theta_j := \\theta_j + \\alpha (y^{(i)} - h_\\theta(x^{(i)})) x_j^{(i)}$?",
        [
            "Using the canonical response function mapping natural parameter \\eta = \\theta^T x to canonical exponential-family sufficient statistics yields that exact log-likelihood gradient",
            "All three models optimize hinge loss over support vectors",
            "All three assume equal covariance matrices across classes",
            "The learning rate \\alpha cancels out non-linear activation derivatives arbitrarily",
        ],
        0,
        "Exponential Family: $p(y;\\eta) = b(y)\\exp(\\eta^T T(y) - a(\\eta))$, Canonical link $g(\\mu) = \\eta = \\theta^T x$",
        "When the natural parameter equals $\\theta^T x$, Differentiating the log-partition $a(\\eta)$ equals the distribution mean $\\mathbb{E}[T(y)]$, unifying GLM MLE updates cleanly.",
        "def softmax(logits):\n    z = logits - np.max(logits, axis=-1, keepdims=True)\n    e = np.exp(z)\n    return e / np.sum(e, axis=-1, keepdims=True)",
    ),
    5: (
        "How does Gaussian Discriminant Analysis (GDA) differ fundamentally from Logistic Regression when modeling p(y | x)?",
        [
            "GDA is a generative model fitting class-conditional Gaussians p(x | y) and priors p(y), whereas Logistic Regression directly fits the discriminative boundary p(y | x)",
            "Logistic Regression requires stronger Gaussian normality assumptions on features x than GDA",
            "Naive Bayes cannot handle discrete vocabulary tokens",
            "GDA never uses Bayes' rule during prediction",
        ],
        0,
        "$p(y=1\\mid x) = \\frac{p(x\\mid y=1)p(y=1)}{p(x\\mid y=1)p(y=1) + p(x\\mid y=0)p(y=0)}$",
        "GDA models the joint distribution $p(x, y)$ (more data-efficient if $x|y$ is truly Gaussian), whereas Logistic Regression is strictly discriminative and more robust when features are skewed or Poisson-distributed.",
        "# Laplace smoothing (+1 / +|V|) prevents zero probabilities in Multinomial Naive Bayes\nphi_k_y1 = (word_counts_y1 + 1.0) / (total_words_y1 + vocab_size)",
    ),
    6: (
        "In Support Vector Machines (SVMs), why do we optimize Geometric Margin $\\hat{\\gamma} = \\gamma / \\|w\\|$ instead of Functional Margin $\\hat{\\gamma}^{(i)} = y^{(i)}(w^T x^{(i)} + b)$ alone?",
        [
            "Functional margin can be inflated arbitrarily just by rescaling (w, b) -> (2w, 2b) without moving the decision hyperplane, whereas geometric margin is scale-invariant",
            "Geometric margin eliminates all kernel computations",
            "Functional margin is undefined for linearly separable datasets",
            "Scaling w downward maximizes training error",
        ],
        0,
        "$\\min_{w,b} \\frac{1}{2}\\|w\\|^2 \\quad \\text{s.t. } y^{(i)}(w^T x^{(i)} + b) \\ge 1$",
        "Fixing the functional margin of closest support vectors to 1 turns maximizing geometric margin $1/\\|w\\|$ into the convex quadratic program $\\min \\frac{1}{2}\\|w\\|^2$.",
        "from sklearn.svm import SVC\nsvm_lin = SVC(kernel='linear', C=1.0).fit(X_tr, y_tr)",
    ),
    7: (
        "What condition does Mercer's Theorem establish for a symmetric kernel function K(x, z) to represent a valid inner product $\\phi(x)^T \\phi(z)$ in a high-dimensional feature space?",
        [
            "Its Gram matrix K_{ij} = K(x^{(i)}, x^{(j)}) must be positive semidefinite for any finite sample set",
            "Its determinant must always equal zero for separable classes",
            "Features \\phi(x) must stay under 100 dimensions",
            "All off-diagonal kernel entries must be negative",
        ],
        0,
        "$K(x, z) = \\exp\\!\\left(-\\frac{\\|x - z\\|^2}{2\\sigma^2}\\right) = \\langle \\phi(x), \\phi(z) \\rangle$",
        "Positive semidefiniteness of the kernel matrix guarantees the dual optimization objective remains convex and corresponds to a real Hilbert-space dot product without ever explicitly vectorizing $\\phi(x)$.",
        "def rbf_kernel(x, z, sigma=1.0):\n    return np.exp(-np.sum((x - z) ** 2) / (2.0 * sigma ** 2))",
    ),
    8: (
        "In Structural Risk Minimization vs Regularization (L2 vs L1), why is choosing hyperparameters directly on the final test set invalid?",
        [
            "Iteratively selecting model complexity or regularization to minimize test error leaks test information, optimistically biasing the reported generalization metric",
            "Test sets can never be shuffled",
            "Validation sets are only valid for clustering",
            "Cross-validation requires zero labels",
        ],
        0,
        "Data Hierarchy: $\\mathcal{D}_{\\text{train}}$ (fit weights $\\theta$) $\\to$ $\\mathcal{D}_{\\text{dev}}$ (tune $\\lambda$, depth) $\\to$ $\\mathcal{D}_{\\text{test}}$ (unbiased final evaluation)",
        "Only tuning against train/dev folds preserves $\\mathcal{D}_{\\text{test}}$ as a true out-of-sample benchmark of real-world deployment accuracy.",
        "from sklearn.model_selection import train_test_split\nX_tr, X_tmp, y_tr, y_tmp = train_test_split(X, y, test_size=0.3, random_state=42)\nX_dev, X_te, y_dev, y_te = train_test_split(X_tmp, y_tmp, test_size=0.5, random_state=42)",
    ),
    9: (
        "According to CS229 Statistical Learning Theory, how does sample complexity m for an infinite hypothesis class of VC dimension d scale with $(\\epsilon, \\delta)$ generalization guarantees?",
        [
            "m scales linearly with VC(H): m = O((1/\\epsilon^2) (d log(1/\\epsilon) + log(1/\\delta))) — roughly proportional to parameters/VC dimension d",
            "m grows exponentially 2^d even for linear hyperplanes",
            "Generalization error depends solely on dataset size and never on hypothesis capacity",
            "Increasing training epochs eliminates irreducible Bayes error",
        ],
        0,
        "$\\varepsilon(\\hat{h}) \\le \\varepsilon(h^*) + 2\\sqrt{\\frac{d}{m}\\log\\frac{2em}{d} + \\frac{1}{m}\\log\\frac{4}{\\delta}}$",
        "VC theory bounds generalization gap in terms of hypothesis capacity $d=\\text{VC}(\\mathcal{H})$ divided by sample count $m$, explaining the Bias-Variance trade-off formally.",
        "# For d-dimensional linear classifiers with bias in R^d, VC(H) = d + 1\nvc_dim = num_features + 1",
    ),
    10: (
        "How do Bagging (Random Forests) and Boosting differ mathematically in their effect on Bias and Variance?",
        [
            "Random Forests average decorrelated low-bias/high-variance trees to slash variance, whereas Boosting trains shallow high-bias trees sequentially on residuals/weights to lower bias",
            "Bagging trains trees sequentially while Boosting trains independent bootstrap copies in parallel",
            "Random Forests require feature normalization before Gini splits",
            "Boosting strictly increases variance with every small learning rate step \\eta",
        ],
        0,
        "Random Forest: $\\hat{f}_{\\text{RF}}(x) = \\frac{1}{B}\\sum_{b=1}^B T_b(x)$ | Boosting: $F_t(x) = F_{t-1}(x) + \\eta h_t(x)$",
        "Decorrelating feature subsets (`max_features`) lowers inter-tree correlation $\\rho$ in variance averaging $\\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$, while gradient boosting optimizes additive bias reduction.",
        "from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\nrf = RandomForestClassifier(n_estimators=200, max_features='sqrt')",
    ),
    11: (
        "Why must hidden layers in a Deep Neural Network apply non-linear activation functions (like ReLU, GELU, or tanh) between affine weight matrices W^{[l]}?",
        [
            "Composing purely linear layers W^{[L]} ... W^{[1]} x collapses mathematically into a single linear transformation W_{eq} x, gaining zero representational depth",
            "Non-linear activations prevent matrix multiplication during forward propagation",
            "ReLU guarantees convexity of deep neural network loss surfaces",
            "Linear layers cannot compute continuous outputs",
        ],
        0,
        "$z^{[l]} = W^{[l]} a^{[l-1]} + b^{[l]}, \\quad a^{[l]} = \\max(0, z^{[l]})$",
        "Without element-wise non-linearities, stacking $L$ matrix multiplications has identical expressive power to a single-layer perceptron.",
        "import torch.nn as nn\nnet = nn.Sequential(nn.Linear(128, 256), nn.ReLU(), nn.Linear(256, 10))",
    ),
    12: (
        "Why do vanishing/exploding gradients occur during Backpropagation in deep networks, and what combination mitigates them directly?",
        [
            "Repeated chain-rule products of Jacobians \\prod_l (W^{[l]T} diag(\\sigma'(z^{[l]}))) shrink exponentially under saturating sigmoids; ReLU, He/Xavier variance scaling & residual skip connections preserve gradient norms",
            "Backpropagation only computes gradients for the output layer",
            "Zero-initializing all weight matrices solves symmetry breaking without vanishing gradients",
            "Increasing mini-batch size to 1 eliminates chain rule derivatives",
        ],
        0,
        "$\\delta^{[l]} = ((W^{[l+1]})^T \\delta^{[l+1]}) \\odot g'(z^{[l]}), \\quad \\text{He init: } \\text{Var}(W^{[l]}) = \\frac{2}{n^{[l-1]}}$",
        "Unsaturated ReLU slopes (=1 for z>0), variance-preserving Xavier/He initialization, Batch/LayerNorm, and identity shortcuts stabilize backward gradient flow across dozens of layers.",
        "import torch.nn.init as init\nlayer = nn.Linear(256, 256)\ninit.kaiming_normal_(layer.weight, nonlinearity='relu')  # He initialization",
    ),
    13: (
        "During ML Error Analysis & Ablation Studies on a deep system lagging behind human-level accuracy, what is the principled first diagnostic step?",
        [
            "Manually inspect misclassified dev examples (e.g., 100 errors) to quantify which error slice contributes most before tuning architecture or collecting random data",
            "Immediately triple the depth of the neural network without inspecting errors",
            "Add training samples to the test set until accuracy crosses 99%",
            "Disable regularization completely when high variance (gap = Train 99% vs Dev 72%) occurs",
        ],
        0,
        "Avoidable Bias $= \\text{Train Error} - \\text{Human Bayes}$, Variance $= \\text{Dev Error} - \\text{Train Error}$",
        "Separating avoidable bias from variance and measuring exact failure modes via Error Analysis + Ablation saves weeks of misguided engineering effort.",
        "# Error analysis bucket breakdown example\nerror_buckets = {'blurry_input': 0.42, 'low_light': 0.31, 'mislabel': 0.14, 'other': 0.13}",
    ),
    14: (
        "How does the Expectation-Maximization (EM) algorithm guarantee monotonic improvement of the marginal log-likelihood $\\ell(\\theta) = \\sum_i \\log \\sum_z p(x^{(i)}, z; \\theta)$ when latent variables $z$ are unobserved?",
        [
            "By applying Jensen's Inequality at the E-step to construct a tight ELBO lower bound Q_i(z) = p(z|x^{(i)}; \\theta) and maximizing that tractable bound in the M-step",
            "By setting all latent cluster assignments permanently at epoch 0",
            "By ignoring Jensen's inequality and differentiating discrete indicator clusters",
            "By computing inverse Hessian determinants at every E-step",
        ],
        0,
        "$\\sum_i \\log p(x^{(i)};\\theta) \\ge \\sum_i \\sum_z Q_i(z) \\log \\frac{p(x^{(i)}, z; \\theta)}{Q_i(z)} = \\text{ELBO}$",
        "Choosing the posterior $Q_i(z) = p(z|x^{(i)};\\theta^{(t)})$ makes Jensen's inequality hold with equality at $\\theta^{(t)}$, so maximizing ELBO forces $\\ell(\\theta^{(t+1)}) \\ge \\ell(\\theta^{(t)})$.",
        "# E-step posterior responsibility for GMM component j:\n# r_ij = (pi_j * N(x_i | mu_j, Sigma_j)) / sum_k (pi_k * N(x_i | mu_k, Sigma_k))",
    ),
    15: (
        "Why is Factor Analysis especially useful when Gaussian Mixture Models or full-covariance MLE fail in settings where feature dimension $n$ exceeds sample size $m$ ($n \\gg m$)?",
        [
            "Factor Analysis models x = \\mu + \\Lambda z + \\epsilon with a low-rank latent factor z \\in \\mathbb{R}^d (d \\ll n) plus diagonal noise \\Psi, preventing singular sample covariance matrices",
            "Factor Analysis forces all dimensions to share zero correlation",
            "GMMs automatically invert singular matrices when m < n",
            "Factor Analysis discards mean vectors and covariance completely",
        ],
        0,
        "$x \\mid z \\sim \\mathcal{N}(\\mu + \\Lambda z, \\Psi) \\implies \\Sigma = \\Lambda\\Lambda^T + \\Psi$",
        "Constraining $\\Sigma = \\Lambda\\Lambda^T + \\Psi$ models high-dimensional correlations parsimoniously using $O(nd + n)$ parameters instead of $O(n^2)$.",
        "from sklearn.decomposition import FactorAnalysis\nfa = FactorAnalysis(n_components=4).fit(X_high_dim)",
    ),
    16: (
        "How do the objectives of Principal Component Analysis (PCA) and Independent Component Analysis (ICA) fundamentally differ?",
        [
            "PCA finds orthogonal directions maximizing captured Gaussian variance (decorrelating covariance), whereas ICA recovers statistically independent non-Gaussian source signals (like separating mixed microphones)",
            "PCA can solve the Cocktail Party problem on isotropic Gaussian noise without whitening",
            "ICA strictly requires orthonormal basis vectors that rank eigenvalues",
            "Both PCA and ICA produce identical rotations up to sign",
        ],
        0,
        "PCA: $\\max_{\\|u\\|=1} u^T \\Sigma u$ | ICA: $s = Wx, \\quad \\ell(W) = \\sum_i \\left(\\sum_j \\log g'(w_j^T x^{(i)}) + \\log|W|\\right)$",
        "PCA only removes 2nd-order correlations (rotation-ambiguous if isotropic covariance), whereas ICA uses non-Gaussianity and higher-order independence to unmix latent sources $s = Wx$.",
        "from sklearn.decomposition import PCA, FastICA\nX_pca = PCA(n_components=2).fit_transform(X)\nS_ica = FastICA(n_components=2, random_state=42).fit_transform(X_mixed)",
    ),
    17: (
        "In the Cocktail Party Problem (ICA Lecture 16), why MUST latent source signals $s_j$ be non-Gaussian (e.g., Laplace or super-Gaussian speech) for unmixing matrix $W$ to be uniquely identifiable?",
        [
            "A multivariate isotropic Gaussian distribution is rotationally symmetric, making any orthogonal mixing rotation R statistically indistinguishable from the identity",
            "Gaussian random variables have undefined gradients",
            "Log-likelihood of Gaussian sources diverges to negative infinity",
            "Sigmoid CDF g(s) equals zero for Gaussian inputs",
        ],
        0,
        "Rotational Invariance of Gaussian: $R s \\sim \\mathcal{N}(0, I) \\iff s \\sim \\mathcal{N}(0, I)$ when $R^T R = I$",
        "Because multivariate Gaussian densities depend only on $\\|s\\|^2$, orthogonal rotations preserve identical likelihoods; non-Gaussian sources break rotational symmetry!",
        "# Standard sigmoid choice in CS229 Bell-Sejnowski ICA gives super-Gaussian source density g'(z) = sig(z)(1-sig(z))\nimport numpy as np\ng = lambda z: 1.0 / (1.0 + np.exp(-z))",
    ),
    18: (
        "In an infinite-horizon discounted Markov Decision Process (MDP), what relationship defines the optimal Value Iteration Bellman operator?",
        [
            "V^*(s) = R(s) + \\gamma \\max_a \\sum_{s'} P_{sa}(s') V^*(s'), converging via contraction factor \\gamma < 1",
            "V^{\\pi}(s) = R(s) - \\max_a V^*(s')",
            "Policy Iteration never updates policy actions \\pi(s)",
            "Discount factor \\gamma must exceed 1 for Bellman convergence",
        ],
        0,
        "Bellman Optimality: $V^*(s) = R(s) + \\gamma \\max_{a \\in A} \\sum_{s' \\in S} P_{sa}(s') V^*(s')$",
        "Because $\\gamma \\in [0, 1)$, the Bellman backup operator is a $\\gamma$-contraction in max-norm $\\|\\cdot\\|_\\infty$, guaranteeing convergence to the unique fixed point $V^*$.",
        "# One synchronous Bellman backup sweep\nV_next[s] = R[s] + gamma * max(sum(P[s, a, sp] * V[sp] for sp in states) for a in actions)",
    ),
    19: (
        "When transitioning from finite-state MDPs to Continuous-State MDPs (e.g. inverted pendulum or robotics in $\\mathbb{R}^n$), why do we use Fitted Value Iteration over grid discretization in dimensions $n \\ge 6$?",
        [
            "Naive uniform grid discretization suffers the Curse of Dimensionality ($k^n$ grid cells), whereas Fitted Value Iteration approximates $V(s) = \\theta^T \\phi(s)$ continuously using sampled states",
            "Continuous states never satisfy the Markov property",
            "Fitted Value Iteration guarantees zero approximation error for arbitrary non-linear transitions",
            "Grid discretization runs in constant O(1) memory regardless of dimension n",
        ],
        0,
        "Fitted Value Iteration Target: $y^{(i)} = R(s^{(i)}) + \\gamma \\max_a \\mathbb{E}_{s'\\sim P_{s^{(i)}a}}[V_\\theta(s')]$",
        "Discretizing each coordinate into 10 buckets explodes exponentially ($10^n$ cells); value function approximation generalizes smoothly across continuous $\\mathbb{R}^n$ trajectories.",
        "# Approximate linear value update at sampled continuous state s_i\ntheta = np.linalg.lstsq(Phi_states, y_targets, rcond=None)[0]",
    ),
    20: (
        "In Continuous Control with Linear Dynamical Systems ($s_{t+1} = A_t s_t + B_t a_t + w_t$) and quadratic costs, what classic optimal control insight enables Linear Quadratic Regulation (LQR)?",
        [
            "Using backward Dynamic Programming shows optimal V^*_t(s_t) stays quadratic in state s_t and the optimal policy a^*_t = L_t s_t is linear and exact even under zero-mean Gaussian noise",
            "LQR requires discretizing continuous steering angles into 1,000 bins",
            "Value functions become non-differentiable triangles at every step",
            "Noise covariance \\Sigma_w changes optimal feedback matrix L_t at every horizon",
        ],
        0,
        "Riccati Recursion: $V_t^*(s_t) = s_t^T \\Phi_t s_t + \\Psi_t, \\quad a_t^* = L_t s_t$",
        "Certainty equivalence in LQR means additive zero-mean Gaussian process noise shifts only the additive scalar offset $\\Psi_t$ without changing the optimal linear feedback gain $L_t$!",
        "# Linear feedback policy derived from Riccati backward pass\ndef lqr_action(L_gain, state_vec):\n    return L_gain @ state_vec",
    ),
    21: (
        "When a Reinforcement Learning agent achieves low real-world performance despite training well in simulation, how does Andrew Ng's CS229 RL Debugging framework isolate whether the bug lies in the Simulator, Value/Policy Optimizer, or Reward Function?",
        [
            "Check if optimized policy V^{\\pi_{\\text{RL}}} underperforms a human trajectory V^{\\pi_{\\text{human}}} on the simulator (if R(\\pi_{\\text{human}}) > R(\\pi_{\\text{RL}}), fix the RL optimizer; otherwise R misses human preference)",
            "Always switch from discounted rewards to undiscounted infinite sums immediately",
            "Increase exploration epsilon to 1.0 permanently during evaluation",
            "Remove dynamics transition modeling completely",
        ],
        0,
        "RL Diagnostic Inequalities: Check $V(\\pi_{\\text{human}})$ vs $V(\\pi_{\\text{RL}})$ inside simulator $\\widehat{M}$",
        "Evaluating a human demonstration inside your learned model cleanly separates MDP optimization failures ($J_{\\text{sim}}(\\pi_{\\text{human}}) > J_{\\text{sim}}(\\pi_{\\text{RL}})$) from misspecified reward functions or inaccurate simulator dynamics.",
        "# Diagnostic audit comparison (simulator reward evaluation)\nif J_sim(human_traj) > J_sim(rl_policy):\n    print('Fix RL optimizer / Value Iteration convergence')\nelse:\n    print('Fix Reward Function R(s, a) or Simulator Dynamics')",
    ),
}

# 20 curated comprehensive questions for the camera-proctored final exam spanning Modules 1..4
DL_FINAL_EXAM_ORDERS: List[int] = list(range(1, 21))


@lru_cache(maxsize=1)
def get_dl_course_catalog() -> Dict[str, Any]:
    return build_course_catalog(
        course_id=DL_COURSE_ID,
        course_title=DL_COURSE_TITLE,
        playlist_id=DL_PLAYLIST_ID,
        playlist_url=DL_PLAYLIST_URL,
        instructor=DL_INSTRUCTOR,
        thumbnail_url=DL_THUMBNAIL_URL,
        playlist_filename="dl_playlist_data.json",
        modules=DL_MODULES,
        quiz_specs=DL_LESSON_QUIZ_SPECS,
        id_prefix="dl",
        curriculum_label="Stanford X Coding Task Factory Academy",
        capstone_projects=DL_CAPSTONE_PROJECTS,
    )


def get_dl_lesson_by_id(lesson_id: str) -> Optional[Dict[str, Any]]:
    return find_lesson_in_catalog(get_dl_course_catalog(), lesson_id)


def get_dl_quiz_bank(include_answers: bool = False) -> List[Dict[str, Any]]:
    return filter_quiz_bank_from_catalog(get_dl_course_catalog(), include_answers=include_answers)


def get_dl_final_exam_questions(include_answers: bool = False) -> List[Dict[str, Any]]:
    return select_exam_questions_from_catalog(
        get_dl_course_catalog(),
        DL_FINAL_EXAM_ORDERS,
        include_answers=include_answers,
    )
