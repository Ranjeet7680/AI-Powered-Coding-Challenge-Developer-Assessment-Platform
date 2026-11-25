"""
Machine Learning Full LMS Course Catalog (106 Video Lectures, Study Notes,
106 Post-Video Comprehension Quizzes, 100-Quiz Mastery Bank & Final Exam Pool).
Built from verified playlist PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF.
"""
import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


PLAYLIST_ID = "PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF"
PLAYLIST_URL = f"https://www.youtube.com/playlist?list={PLAYLIST_ID}"
COURSE_ID = "course-ml-statquest-106"
COURSE_TITLE = "Machine Learning Mastery — Complete 106-Lecture Engineering LMS"
COURSE_INSTRUCTOR = "Josh Starmer (StatQuest) • Curated LMS"

MODULES: List[Dict[str, Any]] = [
    {"id": "mod-1", "order": 1, "title": "ML Fundamentals & Evaluation Metrics", "range": (1, 8)},
    {"id": "mod-2", "order": 2, "title": "Linear Models, Logistic Regression & Regularization", "range": (9, 29)},
    {"id": "mod-3", "order": 3, "title": "Dimensionality Reduction & Clustering", "range": (30, 43)},
    {"id": "mod-4", "order": 4, "title": "Naive Bayes, Decision Trees & Random Forests", "range": (44, 54)},
    {"id": "mod-5", "order": 5, "title": "Gradient Optimization, Boosting & SVMs", "range": (55, 75)},
    {"id": "mod-6", "order": 6, "title": "Neural Networks, CNNs & Sequence Models", "range": (76, 90)},
    {"id": "mod-7", "order": 7, "title": "Transformers, PyTorch & Reinforcement Learning", "range": (91, 106)},
]


def _module_for_order(order: int) -> Dict[str, Any]:
    for m in MODULES:
        lo, hi = m["range"]
        if lo <= order <= hi:
            return m
    return MODULES[-1]


# Per-lesson bespoke Study Notes metadata & exact comprehension quiz keyed by lesson order (1..106)
# Every entry covers real mathematical concepts from the exact corresponding video in ml_playlist_data.json.
LESSON_QUIZ_SPECS: Dict[int, Tuple[str, List[str], int, str, str, str]] = {
    # Format: order: (question, [opt0..opt3], correct_idx, formula_or_concept, explanation, code_snippet)
    1: (
        "Why do we split data into separate training and testing sets in supervised machine learning?",
        [
            "To measure how well a model generalizes to unseen data rather than memorizing training examples",
            "To make gradient descent converge in fewer epochs without computing loss",
            "To guarantee zero bias and zero variance simultaneously",
            "To avoid scaling numerical features before training",
        ],
        0,
        "Model Generalization vs Memorization: $\\mathcal{D} = \\mathcal{D}_{\\text{train}} \\cup \\mathcal{D}_{\\text{test}}$",
        "Testing on held-out data estimates true generalization error instead of rewarding overfitting.",
        "from sklearn.model_selection import train_test_split\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=42)",
    ),
    2: (
        "When comparing multiple candidate models, why is k-fold cross-validation preferred over a single 80/20 split?",
        [
            "Every sample participates in both training and validation across k folds, reducing evaluation variance",
            "It completely removes the need for a held-out final test set",
            "It always lowers training time compared to a single split",
            "It guarantees linearly separable decision boundaries",
        ],
        0,
        "k-Fold CV Risk Estimate: $\\hat{R}_{\\text{CV}} = \\frac{1}{k}\\sum_{i=1}^{k} L(y^{(i)}, \\hat{f}^{-i}(x^{(i)}))$",
        "Averaging performance across k distinct validation folds prevents lucky or unlucky split bias.",
        "from sklearn.model_selection import cross_val_score\nscores = cross_val_score(model, X, y, cv=5)",
    ),
    3: (
        "In a binary Confusion Matrix, what do False Positives (Type I Errors) represent?",
        [
            "Actual negative samples incorrectly predicted as positive",
            "Actual positive samples correctly predicted as positive",
            "Actual positive samples incorrectly missed as negative",
            "Actual negative samples correctly rejected as negative",
        ],
        0,
        "Confusion Matrix Cells: TP, FP (Type I), FN (Type II), TN",
        "A False Positive occurs when the ground-truth label is negative (0) but the classifier outputs positive (1).",
        "from sklearn.metrics import confusion_matrix\ncm = confusion_matrix(y_true, y_pred)",
    ),
    4: (
        "Which formula defines Sensitivity (Recall / True Positive Rate)?",
        [
            "TP / (TP + FN)",
            "TN / (TN + FP)",
            "TP / (TP + FP)",
            "(TP + TN) / (TP + TN + FP + FN)",
        ],
        0,
        "$\\text{Sensitivity} = \\frac{TP}{TP + FN}, \\quad \\text{Specificity} = \\frac{TN}{TN + FP}$",
        "Sensitivity measures the fraction of actual positive cases successfully detected by the model.",
        "from sklearn.metrics import recall_score\nrecall = recall_score(y_true, y_pred)",
    ),
    5: (
        "If missing a true positive condition (like cancer screening) carries high cost, which metric pair is prioritized?",
        [
            "Precision vs Accuracy",
            "Recall / Sensitivity (minimizing False Negatives)",
            "R-squared and Adjusted R-squared",
            "Silhouette Score and Inertia",
        ],
        1,
        "Precision $= \\frac{TP}{TP+FP}$ vs Recall $= \\frac{TP}{TP+FN}$",
        "High Recall ensures very few true positives slip through as False Negatives.",
        "from sklearn.metrics import precision_recall_fscore_support\np, r, f1, _ = precision_recall_fscore_support(y_true, y_pred, average='binary')",
    ),
    6: (
        "What characterizes a model suffering from high Variance (overfitting)?",
        [
            "Poor accuracy on both training and test sets",
            "Very low training error coupled with noticeably higher test error",
            "High regularizer penalty shrinking all coefficients toward zero",
            "Predictions equal to the constant mean of y",
        ],
        1,
        "$\\mathbb{E}[(y - \\hat{f}(x))^2] = \\text{Bias}^2 + \\text{Variance} + \\sigma^2$",
        "High-variance models chase noise in the training fold and degrade sharply on unseen data.",
        "# Reducing high variance: increase regularization or prune tree depth\nmodel = Ridge(alpha=10.0).fit(X_tr, y_tr)",
    ),
    7: (
        "In information theory, when does Shannon Entropy H(X) reach its maximum for a discrete variable with k states?",
        [
            "When one outcome has probability 1 and all others have probability 0",
            "When all k outcomes are equally likely (uniform distribution)",
            "When variance is zero",
            "When Mutual Information equals zero",
        ],
        1,
        "$H(X) = -\\sum_{i} p(x_i) \\log_2 p(x_i)$",
        "Uniform uncertainty yields maximum surprise per observation, maximizing Shannon entropy.",
        "import numpy as np\ndef entropy(p):\n    p = np.asarray(p); p = p[p > 0]\n    return -np.sum(p * np.log2(p))",
    ),
    8: (
        "What does Mutual Information I(X; Y) = 0 tell us about two random variables X and Y?",
        [
            "X and Y are perfectly linearly correlated",
            "X and Y are statistically independent",
            "X always has zero variance",
            "Conditional entropy H(Y|X) equals 1",
        ],
        1,
        "$I(X; Y) = H(Y) - H(Y \\mid X) = D_{\\text{KL}}(P_{X,Y} \\parallel P_X P_Y)$",
        "Zero Mutual Information means observing X reduces uncertainty about Y by zero bits—they are independent.",
        "from sklearn.feature_selection import mutual_info_classif\nmi = mutual_info_classif(X, y, random_state=42)",
    ),
    9: (
        "How does Ordinary Least Squares (OLS) choose the best-fitting line for numeric data?",
        [
            "Minimizes the sum of squared vertical residuals between observed y and predicted y-hat",
            "Maximizes the count of points falling strictly above the line",
            "Minimizes the absolute sum of orthogonal distances while ignoring outliers",
            "Sets all feature weights equal to feature means",
        ],
        0,
        "$\\min_{w,b} \\sum_{i=1}^{n} (y_i - (w x_i + b))^2$",
        "OLS minimizes the Sum of Squared Residuals (SSR / MSE).",
        "from sklearn.linear_model import LinearRegression\nreg = LinearRegression().fit(X_tr, y_tr)",
    ),
    10: (
        "What does the coefficient of determination R^2 quantify in Linear Regression?",
        [
            "The fraction of variance in y around its mean explained by the fitted regression model",
            "The p-value that slope equals infinity",
            "The total number of outliers in the training data",
            "The learning rate step size of gradient descent",
        ],
        0,
        "$R^2 = 1 - \\frac{\\text{SS}_{\\text{res}}}{\\text{SS}_{\\text{tot}}}$",
        "R-squared measures how much residual variance shrinks compared to predicting the baseline mean.",
        "r2 = reg.score(X_te, y_te)",
    ),
    11: (
        "Why does adding irrelevant predictors always leave standard R^2 non-decreasing, making Adjusted R^2 useful in Multiple Regression?",
        [
            "Adding features reduces degrees of freedom and OLS can never worsen in-sample SSR; Adjusted R^2 penalizes extra predictors",
            "Multiple Regression drops correlated variables automatically",
            "Standard R^2 excludes the intercept bias term",
            "OLS regularizes weights with an L1 penalty by default",
        ],
        0,
        "$R^2_{\\text{adj}} = 1 - (1 - R^2)\\frac{n - 1}{n - p - 1}$",
        "Adjusted R-squared penalizes unnecessary predictors via degrees-of-freedom scaling.",
        "adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)",
    ),
    12: (
        "How can a single linear model framework perform t-tests and ANOVA across categorical groups?",
        [
            "By encoding group membership with indicator (dummy) columns in the design matrix and comparing full vs reduced residual sum of squares",
            "By applying K-Means before computing Pearson r",
            "By dropping continuous features during training",
            "By normalizing target labels via softmax",
        ],
        0,
        "F-statistic $= \\frac{(\\text{SS}_{\\text{mean}} - \\text{SS}_{\\text{fit}}) / (p_{\\text{fit}} - p_{\\text{mean}})}{\\text{SS}_{\\text{fit}} / (n - p_{\\text{fit}})}$",
        "Indicator columns turn group means into linear regression coefficients testable via F-statistics.",
        "import numpy as np\n# Design matrix [intercept, group_B_indicator]\nX = np.array([[1, 0], [1, 0], [1, 1], [1, 1]])",
    ),
    13: (
        "In a Design Matrix X for regression with k categorical levels plus an intercept, why do we typically use k - 1 dummy columns?",
        [
            "To avoid exact multicollinearity (the dummy variable trap) where columns sum identically to the intercept column of 1s",
            "To double the convergence speed of Newton-Raphson",
            "To force negative weights on the baseline category",
            "To ensure tree splitting ignores categorical levels",
        ],
        0,
        "$y = X\\beta + \\varepsilon$, $\\text{rank}(X) = p$ full column rank",
        "Including k dummy columns plus an intercept makes X rank-deficient, so (X^T X) becomes non-invertible.",
        "import pandas as pd\nX_design = pd.get_dummies(df, drop_first=True)",
    ),
    14: (
        "If an event has probability p = 0.8, what are its Odds and Log(Odds) / logit?",
        [
            "Odds = 4.0 and logit(p) = ln(4)",
            "Odds = 0.8 and logit(p) = ln(0.8)",
            "Odds = 0.25 and logit(p) = ln(0.25)",
            "Odds = 5.0 and logit(p) = 0",
        ],
        0,
        "$\\text{Odds}(p) = \\frac{p}{1 - p}, \\quad \\text{logit}(p) = \\ln\\left(\\frac{p}{1 - p}\\right)$",
        "Odds = 0.8 / (1 - 0.8) = 4.0, mapping [0,1] probabilities symmetrically onto (-inf, +inf) via ln.",
        "import math\np = 0.8\nodds = p / (1 - p)\nlog_odds = math.log(odds)",
    ),
    15: (
        "Why are Odds Ratios asymmetric around 1 before taking logs, whereas Log(Odds Ratios) are symmetric around 0?",
        [
            "Because Odds Ratios span (0, 1) for decreased odds vs (1, inf) for increased odds; log maps reciprocals symmetrically to +/-",
            "Because probabilities can exceed 1",
            "Because p-values equal the log of the intercept",
            "Because softmax normalizes columns instead of rows",
        ],
        0,
        "$\\ln(\\text{OR}) = \\ln\\left(\\frac{\\text{Odds}_1}{\\text{Odds}_0}\\right)$",
        "Taking the natural logarithm transforms reciprocal ratios like 1/4 and 4/1 into symmetric -ln(4) and +ln(4).",
        "import math\nprint(round(math.log(0.25), 3), round(math.log(4.0), 3))",
    ),
    16: (
        "How does Logistic Regression convert a linear combination w^T x + b into a binary class probability?",
        [
            "By passing it through the sigmoid logistic function sigma(z) = 1 / (1 + e^-z)",
            "By thresholding OLS predictions at zero",
            "By computing Euclidean distance to two cluster centers",
            "By picking the majority vote of decision stumps",
        ],
        0,
        "$P(y=1\\mid x) = \\sigma(z) = \\frac{1}{1 + e^{-z}}$",
        "The sigmoid maps unbounded real log-odds scores strictly into valid probabilities in (0, 1).",
        "import numpy as np\ndef sigmoid(z): return 1.0 / (1.0 + np.exp(-z))",
    ),
    17: (
        "In Logistic Regression y = b0 + b1*x1, what does coefficient b1 directly represent?",
        [
            "The change in log(odds) per unit increase in x1",
            "The direct change in probability p per unit increase in x1",
            "The Gini impurity of feature x1",
            "The eigenvalue ratio along PC1",
        ],
        0,
        "$\\ln\\frac{p}{1-p} = \\beta_0 + \\beta_1 x_1$",
        "Coefficients operate linearly in log-odds space rather than directly on raw probability.",
        "from sklearn.linear_model import LogisticRegression\nclf = LogisticRegression().fit(X_tr, y_tr)",
    ),
    18: (
        "Why does Logistic Regression use Maximum Likelihood Estimation (MLE) instead of Least Squares residuals?",
        [
            "Binary outcomes follow a Bernoulli likelihood; maximizing log-likelihood fits the sigmoid curve directly without assuming constant residual variance",
            "MLE does not require iterative optimization",
            "Least Squares cannot be differentiated",
            "MLE always gives higher R^2 than Linear Regression",
        ],
        0,
        "$\\mathcal{L}(\\beta) = \\prod_i p_i^{y_i}(1 - p_i)^{1 - y_i}$",
        "Maximizing Bernoulli log-likelihood (equivalently minimizing binary cross-entropy) yields convex optimization for Logistic Regression.",
        "from sklearn.metrics import log_loss\nloss = log_loss(y_true, y_prob)",
    ),
    19: (
        "What does McFadden's pseudo-R^2 compare in Logistic Regression evaluation?",
        [
            "The log-likelihood of the fitted model against the log-likelihood of the intercept-only null model",
            "True positives against false positives across thresholds",
            "Gini index before and after tree pruning",
            "L1 norm against L2 norm of weights",
        ],
        0,
        "$R^2_{\\text{McFadden}} = 1 - \\frac{\\ell_{\\text{fit}}}{\\ell_{\\text{null}}}$",
        "Comparing log-likelihood improvement over the null model quantifies predictive gain for binary outcomes.",
        "mc_fadden_r2 = 1.0 - (ll_fit / ll_null)",
    ),
    20: (
        "What is the Null vs Residual Deviance in generalized linear / logistic models?",
        [
            "Measures of lack-of-fit equal to 2 * (log-likelihood(saturated) - log-likelihood(model))",
            "The squared Euclidean distance between class centroids",
            "The drop in Entropy across leaf nodes",
            "The ratio of training time to test time",
        ],
        0,
        "$D = 2(\\ell_{\\text{saturated}} - \\ell_{\\text{model}})$",
        "Lower residual deviance indicates a model close to the saturated perfect-fit benchmark.",
        "# Deviance drop follows a chi-square distribution under the null hypothesis",
    ),
    21: (
        "In R's glm(..., family='binomial'), how is Logistic Regression specified cleanly?",
        [
            "Setting family = 'binomial' links linear predictors via logit to binary observations",
            "Setting method = 'kmeans' computes cluster odds",
            "Using prcomp() estimates log-odds slopes",
            "Using lm() automatically clamps outputs to [0,1]",
        ],
        0,
        "`glm(y ~ x1 + x2, data=df, family='binomial')`",
        "Binomial family in generalized linear models uses the canonical logit link for binary classification.",
        "# Python equivalent via statsmodels\n# sm.GLM(y, sm.add_constant(X), family=sm.families.Binomial()).fit()",
    ),
    22: (
        "Why do practitioners inspect Deviance Residuals in GLMs?",
        [
            "To identify poorly fit individual observations and detect non-linear patterns or outliers",
            "To compute attention weights in transformers",
            "To initialize K-Means centroids",
            "To sort eigenpairs descending in PCA",
        ],
        0,
        "$r_i^D = \\text{sign}(y_i - \\hat{p}_i)\\sqrt{d_i}$",
        "Deviance residuals measure each sample's contribution to total model deviance.",
        "# Large |r_i^D| highlights misclassified outliers with extreme confidence",
    ),
    23: (
        "What does every point along an ROC (Receiver Operating Characteristic) curve represent?",
        [
            "The True Positive Rate vs False Positive Rate pair at one specific classification probability threshold",
            "Loss vs Epoch number during SGD training",
            "Bias vs Variance across polynomial degrees",
            "Recall vs Tree Depth",
        ],
        0,
        "AUC $= \\int_0^1 \\text{TPR}(\\text{FPR}^{-1}(t))\\,dt$",
        "Sweeping the decision threshold from 1 down to 0 traces TPR against FPR; higher AUC reflects stronger ranking separation.",
        "from sklearn.metrics import roc_auc_score\nauc = roc_auc_score(y_true, y_scores)",
    ),
    24: (
        "When datasets exhibit severe class imbalance (e.g. 99% negatives), why should ROC-AUC often be paired with Precision-Recall AUC?",
        [
            "False Positive Rate divides by a huge TN count, masking many false alarms that Precision immediately exposes",
            "ROC-AUC ignores False Negatives completely",
            "Precision-Recall curves require zero thresholds",
            "ROC curves are undefined for binary labels",
        ],
        0,
        "Precision $= \\frac{TP}{TP+FP}$ ignores TN",
        "Precision focuses strictly on predicted positives, making Precision-Recall far more sensitive under heavy class imbalance.",
        "from sklearn.metrics import average_precision_score\nap = average_precision_score(y_true, y_scores)",
    ),
    25: (
        "How does Ridge (L2) Regularization shrink model parameters to reduce variance?",
        [
            "Adds lambda * sum(w_j^2) to the loss, shrinking coefficients smoothly toward zero without exact zeroing",
            "Adds lambda * sum(|w_j|) to drop features to zero",
            "Randomly zeros hidden neuron activations",
            "Increases polynomial degree exponentially",
        ],
        0,
        "$J_{\\text{Ridge}}(w) = \\sum (y_i - \\hat{y}_i)^2 + \\lambda \\sum_j w_j^2$",
        "The squared L2 penalty introduces slight bias in exchange for substantially lower variance on correlated predictors.",
        "from sklearn.linear_model import Ridge\nmodel = Ridge(alpha=1.0).fit(X_tr, y_tr)",
    ),
    26: (
        "What distinct advantage does Lasso (L1) Regression offer over Ridge Regression?",
        [
            "L1 penalty corners can drive irrelevant weights identically to zero, performing automatic feature selection",
            "L1 has an analytical closed-form inverse (X^T X + lambda I)^-1",
            "L1 never requires scaling input features",
            "L1 eliminates bias completely",
        ],
        0,
        "$J_{\\text{Lasso}}(w) = \\sum (y_i - \\hat{y}_i)^2 + \\lambda \\sum_j |w_j|$",
        "The L1 diamond constraint intersects level-set contours on coordinate axes, inducing sparse weights.",
        "from sklearn.linear_model import Lasso\nmodel = Lasso(alpha=0.1).fit(X_tr, y_tr)",
    ),
    27: (
        "Notice why scaling/standardizing features is mandatory before applying Ridge or Lasso:",
        [
            "Regularization penalizes raw weight magnitudes equally, so features with smaller numeric units would otherwise be unfairly shrunk",
            "Standardizing turns continuous targets into categories",
            "Gradient boosting requires zero-mean trees",
            "Standardizing removes outliers monotonically",
        ],
        0,
        "$z_j = (x_j - \\mu_j) / \\sigma_j$",
        "Because penalties depend directly on coefficient size, input columns must share a comparable scale.",
        "from sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import make_pipeline\npipe = make_pipeline(StandardScaler(), Ridge(alpha=1.0))",
    ),
    28: (
        "Why does Elastic Net combine both L1 (Lasso) and L2 (Ridge) penalties?",
        [
            "Achieves sparse feature selection (L1) while stably grouping correlated predictors (L2) even when p > n",
            "Because L1 alone cannot be optimized with coordinate descent",
            "To transform logistic regression into KNN",
            "To double the intercept bias",
        ],
        0,
        "$J_{\\text{EN}}(w) = \\text{SSR} + \\lambda_1 \\sum |w_j| + \\lambda_2 \\sum w_j^2$",
        "Elastic Net bridges L1 sparsity and L2 correlated-feature grouping.",
        "from sklearn.linear_model import ElasticNet\nmodel = ElasticNet(alpha=0.1, l1_ratio=0.5).fit(X_tr, y_tr)",
    ),
    29: (
        "How do practitioners select optimal regularization strength lambda (alpha) in Ridge/Lasso/Elastic-Net?",
        [
            "Cross-validation (e.g. RidgeCV / LassoCV / ElasticNetCV) across candidate alpha grids",
            "Always fixing alpha = 1000",
            "Maximizing training SSR",
            "Computing determinant of residual matrix",
        ],
        0,
        "Cross-Validated $\\alpha^* = \\arg\\min_\\alpha \\text{CV-Error}(\\alpha)$",
        "CV selects the penalty balancing bias and variance on unseen validation folds.",
        "from sklearn.linear_model import ElasticNetCV\ncv_model = ElasticNetCV(cv=5, l1_ratio=[0.1, 0.5, 0.9]).fit(X_tr, y_tr)",
    ),
    30: (
        "In Principal Component Analysis (PCA), how are Principal Components ordered?",
        [
            "Orthogonally ordered from highest to lowest captured data variance (largest eigenvalues first)",
            "Randomly shuffled before matrix SVD",
            "Ordered by target label correlation regardless of variance",
            "Ordered from smallest eigenvalue to largest",
        ],
        0,
        "$\\Sigma v_k = \\lambda_k v_k$, with $\\lambda_1 \\ge \\lambda_2 \\ge \\dots$",
        "PC1 aligns with the direction of maximum variance; each subsequent PC is orthogonal and maximizes remaining variance.",
        "from sklearn.decomposition import PCA\npca = PCA(n_components=2).fit(X_scaled)",
    ),
    31: (
        "What do PCA 'loading scores' on a principal component tell us?",
        [
            "The linear weights / relative contribution of each original feature in forming that component",
            "The exact softmax probabilities per class",
            "The optimal K in K-Means",
            "The hinge loss margin width",
        ],
        0,
        "$\\text{PC}_1 = w_{11} x_1 + w_{12} x_2 + \\dots$",
        "Loading vectors reveal which original variables drive each principal axis.",
        "loadings = pca.components_",
    ),
    32: (
        "Why can PCA distort clusters if features are not centered and scaled beforehand?",
        [
            "Variables measured in huge units dominate total variance and monopolize PC1",
            "PCA requires categorical string encodings",
            "Unscaled matrices cannot undergo SVD",
            "Centering deletes negative eigenvalues",
        ],
        0,
        "Standardized SVD of $Z = (X - \\mu)/\\sigma$",
        "Because PCA maximizes raw variance, unscaled large-magnitude columns bias component directions.",
        "X_z = StandardScaler().fit_transform(X)\nX_pca = PCA(n_components=0.95).fit_transform(X_z)",
    ),
    33: (
        "How does a Scree Plot assist during dimensionality reduction with PCA?",
        [
            "Plots explained variance ratio per component to reveal the 'elbow' capturing sufficient signal",
            "Plots training loss vs learning rate",
            "Plots TPR vs FPR at candidate cutoffs",
            "Displays pairwise Manhattan distances",
        ],
        0,
        "$\\text{Explained Ratio}_k = \\lambda_k / \\sum_j \\lambda_j$",
        "Cumulative explained variance guides how many components retain e.g. 95% variance.",
        "cum_var = pca.explained_variance_ratio_.cumsum()",
    ),
    34: (
        "In scikit-learn's PCA workflow, what does `pca.explained_variance_ratio_` sum to across all components?",
        [
            "1.0 (100% of total dataset variance across all orthogonal axes)",
            "0.0",
            "The total number of training samples n",
            "1 / sqrt(n)",
        ],
        0,
        "$\\sum_{k=1}^{p} \\text{EVR}_k = 1.0$",
        "All principal axes together form a full orthogonal basis accounting for 100% of total variance.",
        "assert round(float(pca_full.explained_variance_ratio_.sum()), 6) == 1.0",
    ),
    35: (
        "How does Linear Discriminant Analysis (LDA) differ fundamentally from PCA?",
        [
            "LDA is supervised: it maximizes between-class mean separation while minimizing within-class scatter",
            "LDA is purely unsupervised and ignores class labels",
            "LDA uses radial basis kernels by default",
            "LDA clusters observations without projections",
        ],
        0,
        "$\\max_w \\frac{w^T S_B w}{w^T S_W w}$",
        "Unlike unsupervised PCA, LDA explicitly leverages class labels to maximize class separability.",
        "from sklearn.discriminant_analysis import LinearDiscriminantAnalysis\nlda = LinearDiscriminantAnalysis(n_components=2).fit(X, y)",
    ),
    36: (
        "Why does dimensionality projection like PCA/LDA often start by translating the dataset centroid to the origin?",
        [
            "Centering data around zero aligns covariance calculations cleanly and simplifies SVD / projections through the origin",
            "Because variance requires all numbers to be positive",
            "To double the number of classes",
            "To prevent log(0) inside ReLU",
        ],
        0,
        "$\\tilde{X} = X - \\bar{X} \\implies \\text{Cov}(X) = \\frac{1}{n-1}\\tilde{X}^T \\tilde{X}$",
        "Zero-centering ensures dot products and singular vectors pivot through the data mean.",
        "X_centered = X - X.mean(axis=0)",
    ),
    37: (
        "When does Classical Multidimensional Scaling (MDS / PCoA) reproduce identical coordinates to PCA?",
        [
            "When the pairwise dissimilarity matrix uses standard Euclidean distances",
            "When using Hamming distances on binary genes",
            "When K-Means converges in 1 step",
            "When Manhattan distance replaces L2",
        ],
        0,
        "$D_{ij} = \\|x_i - x_j\\|_2 \\implies \\text{PCoA} \\equiv \\text{PCA}$",
        "PCA maximizes variance along linear axes while PCoA preserves pairwise distances; with Euclidean distances both are mathematically equivalent.",
        "from sklearn.manifold import MDS\nX_mds = MDS(n_components=2, random_state=42).fit_transform(X)",
    ),
    38: (
        "What input can PCoA / MDS accept that raw PCA cannot operate on directly?",
        [
            "An arbitrary pairwise dissimilarity / biological distance matrix (like Bray-Curtis or UniFrac)",
            "Only 1D numeric vectors",
            "Unscaled text strings without tokenization",
            "Only binary class labels",
        ],
        0,
        "Eigen-decomposition of doubly-centered distance matrix $B = -\\frac{1}{2} J D^{(2)} J$",
        "PCoA generalizes PCA to non-Euclidean distance matrices.",
        "from sklearn.metrics import pairwise_distances\ndist_mat = pairwise_distances(X, metric='manhattan')",
    ),
    39: (
        "Why does t-SNE model high-dimensional neighborhoods with a Gaussian and low-dimensional ones with a heavy-tailed Student-t distribution?",
        [
            "Heavy tails alleviate the 'crowding problem', keeping moderately distant clusters cleanly separated in 2D",
            "Student-t allows linear extrapolation to unseen test samples without refitting",
            "Gaussian distributions cannot handle distances in 2D",
            "To minimize Euclidean distances globally at the expense of local neighbors",
        ],
        0,
        "$\\min \\text{KL}(P \\parallel Q)$ where $q_{ij} \\propto (1 + \\|z_i - z_j\\|^2)^{-1}$",
        "t-SNE excels at preserving local neighborhood structure visually by giving non-adjacent clusters room in 2D.",
        "from sklearn.manifold import TSNE\nZ = TSNE(n_components=2, perplexity=30, random_state=42).fit_transform(X)",
    ),
    40: (
        "What does a Dendrogram visualize in Hierarchical Agglomerative Clustering?",
        [
            "The nested sequence of bottom-up cluster merges and the similarity/distance height at each merge",
            "Gradient magnitudes per neural layer",
            "Training vs validation ROC curves",
            "Decision tree Gini impurity splits",
        ],
        0,
        "Linkage metrics: Single, Complete, Average, Ward",
        "Cutting a dendrogram horizontally at any height reveals the corresponding number of clusters.",
        "from sklearn.cluster import AgglomerativeClustering\nlabels = AgglomerativeClustering(n_clusters=3, linkage='ward').fit_predict(X)",
    ),
    41: (
        "How do you choose the elbow point K in K-Means Clustering?",
        [
            "Plot total within-cluster sum of squares (inertia) vs K and pick where marginal reduction levels off",
            "Pick K equal to total dataset size n",
            "Pick K that maximizes training SSE",
            "Use Gini impurity of class labels",
        ],
        0,
        "$\\text{Inertia} = \\sum_{k=1}^K \\sum_{x_i \\in C_k} \\|x_i - \\mu_k\\|_2^2$",
        "Beyond the elbow K, adding extra centroids mostly splits coherent groups with little reduction in variance.",
        "from sklearn.cluster import KMeans\nkm = KMeans(n_clusters=4, n_init='auto', random_state=42).fit(X)",
    ),
    42: (
        "Why does DBSCAN handle nested or crescent-shaped clusters and outliers better than K-Means?",
        [
            "DBSCAN groups points by connected high-density neighborhoods (eps, min_samples) and labels sparse points as noise (-1)",
            "DBSCAN assumes spherical variance around every cluster mean",
            "DBSCAN always creates balanced equal-sized partitions",
            "DBSCAN minimizes dot-product cosine similarity only",
        ],
        0,
        "Core point if $|B_\\varepsilon(x)| \\ge \\text{minPts}$",
        "Density connectivity lets DBSCAN discover non-convex shapes and filter isolated outliers automatically.",
        "from sklearn.cluster import DBSCAN\nlabels = DBSCAN(eps=0.5, min_samples=5).fit_predict(X_scaled)",
    ),
    43: (
        "What happens in K-Nearest Neighbors (KNN) if K is chosen too small (e.g. K = 1)?",
        [
            "High variance / jagged decision boundary sensitive to single noisy outliers",
            "Severe underfitting predicting the global majority everywhere",
            "Exponentially slower tree pruning",
            "Weights collapse to zero via L1 penalty",
        ],
        0,
        "$\\hat{y}(x) = \\text{mode}\\{y_i : x_i \\in N_K(x)\\}$",
        "With K=1, every outlier carves an isolated island around itself, causing overfitting.",
        "from sklearn.neighbors import KNeighborsClassifier\nknn = KNeighborsClassifier(n_neighbors=5).fit(X_tr, y_tr)",
    ),
    44: (
        "Why is Naive Bayes called 'naive'—and why is Laplace (alpha) smoothing applied?",
        [
            "It assumes conditional independence among features given the class; Laplace smoothing prevents zero counts from zeroing entire posterior probabilities",
            "It ignores prior probabilities of rare classes",
            "It only handles continuous Gaussian targets",
            "It assumes training and test labels match identically",
        ],
        0,
        "$P(y\\mid x) \\propto P(y)\\prod_j P(x_j\\mid y)$",
        "Adding pseudocount alpha > 0 prevents an unseen word or token from multiplying the entire product to 0.",
        "from sklearn.naive_bayes import MultinomialNB\nnb = MultinomialNB(alpha=1.0).fit(X_counts, y)",
    ),
    45: (
        "How does Gaussian Naive Bayes estimate likelihoods P(x_j | y) for continuous numerical features?",
        [
            "Fits class-conditional Gaussian (mean, variance) probability density curves per feature",
            "Bins every number into 2 quantiles",
            "Runs Ridge Regression internally",
            "Applies K-Means over each column",
        ],
        0,
        "$P(x_j\\mid y=c) = \\frac{1}{\\sqrt{2\\pi\\sigma_{c,j}^2}}\\exp\\left(-\\frac{(x_j-\\mu_{c,j})^2}{2\\sigma_{c,j}^2}\\right)$",
        "Using the Gaussian PDF lets Naive Bayes score continuous measurements seamlessly.",
        "from sklearn.naive_bayes import GaussianNB\ngnb = GaussianNB().fit(X_tr, y_tr)",
    ),
    46: (
        "How does a Classification Tree pick the optimal feature threshold at each node split?",
        [
            "Evaluates weighted impurity reduction (Gini impurity or Entropy gain) across splits and picks the purest child partition",
            "Solves normal equations (X^T X)^-1 X^T y",
            "Finds eigenvectors of feature correlation",
            "Maximizes Euclidean margin between hyperplanes",
        ],
        0,
        "$\\text{Gini} = 1 - \\sum_{c} p_c^2$",
        "Lower weighted Gini impurity means leaf subsets contain clearer class separation.",
        "from sklearn.tree import DecisionTreeClassifier\ndt = DecisionTreeClassifier(criterion='gini', max_depth=5).fit(X_tr, y_tr)",
    ),
    47: (
        "How can Decision Trees handle missing values in training or test features?",
        [
            "Using surrogate splits or routing weighted/imputed correlations down branches that best mimic the primary split",
            "Dropping all rows across the entire dataset permanently",
            "Converting missing floats to infinity",
            "Setting learning rate to zero",
        ],
        0,
        "Surrogate split correlation & CART missing routing",
        "Surrogate predictors and histogram-based default directions keep samples usable despite missing attributes.",
        "from sklearn.impute import SimpleImputer\nimp = SimpleImputer(strategy='median').fit(X_tr)",
    ),
    48: (
        "In a Regression Tree, what value does a leaf node output for numeric targets?",
        [
            "The average (mean) of training target values falling inside that leaf region",
            "A continuous sigmoid probability",
            "The eigenvector loading along PC1",
            "A linear OLS regression weight vector",
        ],
        0,
        "Split criterion: minimize $\\sum_{i\\in L}(y_i-\\bar{y}_L)^2 + \\sum_{i\\in R}(y_i-\\bar{y}_R)^2$",
        "Regression trees partition feature space to minimize sum of squared errors within each leaf.",
        "from sklearn.tree import DecisionTreeRegressor\nrt = DecisionTreeRegressor(min_samples_leaf=5).fit(X_tr, y_tr)",
    ),
    49: (
        "How does Cost-Complexity Pruning (weakest-link pruning, ccp_alpha) prevent Decision Trees from overfitting?",
        [
            "Adds alpha * |T| penalty to total leaf SSR, trimming subtrees whose error reduction fails to justify extra leaves",
            "Forces all splits at depth 1 only",
            "Replaces Gini impurity with softmax cross-entropy",
            "Doubles tree depth until pure leaves",
        ],
        0,
        "$R_\\alpha(T) = R(T) + \\alpha |T|$",
        "Cost-complexity alpha trades tiny training error increases for dramatic variance reduction on unseen test folds.",
        "dt_pruned = DecisionTreeRegressor(ccp_alpha=0.01).fit(X_tr, y_tr)",
    ),
    50: (
        "Why is Out-of-Fold (K-Fold) Target Encoding much safer against data leakage than naive Target Encoding?",
        [
            "Computes target averages solely from other folds rather than leaking each row's own target value into its feature",
            "One-hot encodes continuous floats automatically",
            "Requires zero labeled rows",
            "Guarantees orthogonal categories",
        ],
        0,
        "$\\hat{x}_i^{(k)} = \\frac{\\sum_{j\\notin F_k, c_j=c_i} y_j + m\\bar{y}}{n_{c_i} + m}$",
        "Excluding a row's own fold when calculating category target means stops trees from memorizing label leakage.",
        "from sklearn.preprocessing import TargetEncoder\nte = TargetEncoder(cv=5, smooth='auto').fit(X_cat, y)",
    ),
    51: (
        "When building Classification Trees in Python (`sklearn.tree`), why set `min_samples_leaf` or `max_depth`?",
        [
            "To stop individual leaves from memorizing tiny 1-sample islands of noise",
            "To speed up PCA SVD factorization",
            "To transform inputs into tensors",
            "To convert labels into continuous targets",
        ],
        0,
        "Structural regularization: `max_depth`, `min_samples_split`, `ccp_alpha`",
        "Constraining tree capacity lowers variance and improves out-of-sample generalization.",
        "dt = DecisionTreeClassifier(max_depth=6, min_samples_leaf=10, random_state=42)",
    ),
    52: (
        "What two sources of randomness make a Random Forest generalize far better than a single Decision Tree?",
        [
            "Bootstrap sampling rows (bagging) + random subset of features evaluated at each split",
            "Adaptive learning rates + L1 weights",
            "Gaussian noise + cosine similarity",
            "Sigmoid activation + attention masking",
        ],
        0,
        "Out-of-Bag (OOB) validation uses $\\approx 36.8\\%$ unselected samples per tree",
        "De-correlating trees via bagging and feature subsampling sharply cuts ensemble variance.",
        "from sklearn.ensemble import RandomForestClassifier\nrf = RandomForestClassifier(n_estimators=200, oob_score=True, random_state=42).fit(X_tr, y_tr)",
    ),
    53: (
        "How can Random Forests estimate proximity / pairwise similarity and impute missing values iteratively?",
        [
            "Two samples landing in the same terminal leaf across many trees receive higher proximity weight, refining initial imputations",
            "Using L2 penalty across leaf thresholds",
            "Computing t-SNE perplexity prior to splitting",
            "Running backpropagation across trees",
        ],
        0,
        "Proximity $P(i, j) = \\frac{1}{T} \\sum_t \\mathbb{1}[\\text{leaf}_t(x_i) = \\text{leaf}_t(x_j)]$",
        "Leaf co-occurrence gives a rich non-linear similarity matrix useful for clustering and iterative imputation.",
        "# Leaf co-occurrence indices via rf.apply(X)",
    ),
    54: (
        "When evaluating Random Forests via Out-of-Bag (OOB) error, why isn't a separate validation set strictly mandatory?",
        [
            "Each observation is excluded from ~1/3 of bootstrap trees, giving an unbiased OOB prediction estimate across the ensemble",
            "Random Forests never overfit even with 1 tree",
            "All features are scaled to [0,1]",
            "Trees only train on test samples",
        ],
        0,
        "$P(\\text{not drawn in } n \\text{ draws}) = (1 - \\frac{1}{n})^n \\approx e^{-1} \\approx 0.368$",
        "Predicting each training sample exclusively using trees that did not bootstrap it yields built-in cross-validation.",
        "print('OOB Accuracy:', rf.oob_score_)",
    ),
    55: (
        "What role does the Chain Rule play in optimization and neural network training?",
        [
            "Multiplies local partial derivatives along composed computational graphs to compute exact parameter gradients",
            "Sorts eigenvalues inside PCA",
            "Computes Gini impurity in Random Forests",
            "Generates orthogonal dummy columns",
        ],
        0,
        "$\\frac{d}{dx} f(g(x)) = f'(g(x)) \\cdot g'(x)$",
        "The Chain Rule makes automatic differentiation and backpropagation tractable across arbitrarily deep compositions.",
        "# dL/dw = (dL/dy_hat) * (dy_hat/dz) * (dz/dw)",
    ),
    56: (
        "In Gradient Descent w := w - eta * grad(L), what happens if learning rate eta is much too large?",
        [
            "Steps overshoot the minimum valley and loss oscillates wildly or diverges",
            "Convergence happens in exact closed form",
            "Gradients drop identically to zero",
            "Overfitting disappears completely",
        ],
        0,
        "$\\theta_{t+1} = \\theta_t - \\eta \\nabla_\\theta \\mathcal{L}(\\theta_t)$",
        "Oversized steps bounce up opposite valley walls instead of descending smoothly toward the minimum.",
        "w = w - lr * grad",
    ),
    57: (
        "Why does Stochastic / Mini-Batch Gradient Descent scale dramatically better than full-batch Gradient Descent on huge datasets?",
        [
            "Updates parameters frequently using 1 sample or small mini-batches rather than evaluating gradients over all millions of rows per step",
            "It skips computing derivatives entirely",
            "It converts non-linear models into linear models",
            "It eliminates learning rate tuning",
        ],
        0,
        "$\\theta_{t+1} = \\theta_t - \\eta \\nabla \\mathcal{L}_{B_t}(\\theta_t)$ where $|B_t| \\ll N$",
        "Mini-batch noise even helps escape shallow saddle points while providing O(batch) step cost.",
        "from sklearn.linear_model import SGDClassifier\nsgd = SGDClassifier(loss='log_loss', learning_rate='optimal')",
    ),
    58: (
        "How does AdaBoost differ from Random Forest in how weak learners (stumps) are combined?",
        [
            "AdaBoost builds stumps sequentially—upweighting misclassified samples—and weights final votes by stump accuracy",
            "AdaBoost trains deep trees independently in parallel with uniform weights",
            "AdaBoost removes misclassified samples completely",
            "AdaBoost requires neural networks",
        ],
        0,
        "$\\alpha_t = \\frac{1}{2} \\ln\\left(\\frac{1 - \\epsilon_t}{\\epsilon_t}\\right)$",
        "Sequential sample reweighting forces subsequent stumps to focus specifically on previously missed examples.",
        "from sklearn.ensemble import AdaBoostClassifier\nada = AdaBoostClassifier(n_estimators=100, random_state=42).fit(X_tr, y_tr)",
    ),
    59: (
        "In Gradient Boosting for Regression (Part 1), what target does each new decision tree fit?",
        [
            "The pseudo-residuals (observed y minus current cumulative ensemble prediction), scaled by learning rate",
            "The raw y values unchanged at every step",
            "Principal component projections of X",
            "Uniform random cluster IDs",
        ],
        0,
        "$r_{i,m} = y_i - F_{m-1}(x_i) = -\\left.\\frac{\\partial L(y_i, F)}{\\partial F}\\right|_{F_{m-1}}$",
        "Each boosting tree iteratively nudges ensemble predictions in the negative gradient direction of the loss.",
        "from sklearn.ensemble import GradientBoostingRegressor\ngbr = GradientBoostingRegressor(learning_rate=0.1, n_estimators=200)",
    ),
    60: (
        "What does the shrinkage / learning_rate parameter nu (< 1) accomplish in Gradient Boosting?",
        [
            "Scales each new tree's residual contribution smoothly, reducing variance and improving generalization",
            "Multiplies tree depth exponentially",
            "Drops random columns before training",
            "Eliminates residuals on tree 1",
        ],
        0,
        "$F_m(x) = F_{m-1}(x) + \\nu \\cdot h_m(x)$",
        "Taking many small cautious steps yields lower test error than taking greedy giant steps.",
        "# Small learning_rate paired with sufficient n_estimators avoids overfitting",
    ),
    61: (
        "In Gradient Boosting for Classification (Part 3), why do trees output log-odds leaf adjustments converted via sigmoid?",
        [
            "Because summing raw probabilities can leave [0, 1], whereas log-odds residuals stay additive before logistic mapping",
            "Because decision trees require negative target probabilities",
            "Because sigmoid disables learning rates",
            "Because cross-entropy has zero derivative in log-odds",
        ],
        0,
        "$p_i = \\sigma(F_m(x_i)), \\quad r_i = y_i - p_i$",
        "Additive boosting updates in log-odds space convert cleanly to calibrated class probabilities.",
        "from sklearn.ensemble import GradientBoostingClassifier\ngbc = GradientBoostingClassifier(learning_rate=0.05, max_depth=3)",
    ),
    62: (
        "What is the exact leaf output adjustment formula for Gradient Boost Classification leaves under log-loss?",
        [
            "sum(Residuals) / sum(Previous_Prob * (1 - Previous_Prob)) derived via second-order Taylor approximation",
            "sum(Residuals) / n_samples",
            "max(Residuals) - min(Residuals)",
            "mean(X_leaf)",
        ],
        0,
        "$\\gamma_{jm} = \\frac{\\sum_{x_i\\in R_{jm}} (y_i - p_i)}{\\sum_{x_i\\in R_{jm}} p_i (1 - p_i)}$",
        "Newton-Raphson one-step approximation divides first derivative sum by second derivative (Hessian) sum.",
        "# Second-order leaf value bridges log-loss curvature cleanly",
    ),
    63: (
        "Why is checking validation performance via Early Stopping helpful when stacking hundreds of boosting iterations?",
        [
            "Stops training once validation loss stops improving, preventing boosting trees from overfitting residual noise",
            "Forces every tree to be a stump of depth 1",
            "Skips computing gradients completely",
            "Doubles training loss on purpose",
        ],
        0,
        "Monitor $\\mathcal{L}_{\\text{val}}$ over `n_iter_no_change` rounds",
        "Early stopping identifies the sweet spot before additional boosted trees memorize training noise.",
        "gbr = GradientBoostingRegressor(n_iter_no_change=10, validation_fraction=0.1)",
    ),
    64: (
        "What makes XGBoost trees different from standard CART Gradient Boosting trees?",
        [
            "XGBoost computes Similarity Scores using L2 regularization (lambda) on leaf weights and Gain to prune weak branches",
            "XGBoost never builds trees sequentially",
            "XGBoost only supports image tensors",
            "XGBoost replaces leaf splits with K-Means",
        ],
        0,
        "$\\text{Similarity} = \\frac{(\\sum r_i)^2}{n + \\lambda}$ (Regression), $\\text{Gain} = \\text{Left} + \\text{Right} - \\text{Root}$",
        "Similarity regularization gamma/lambda guards against small noisy leaf splits.",
        "# Gain - gamma > 0 controls tree pruning inside XGBoost",
    ),
    65: (
        "In XGBoost Classification (Part 2), what denominator replaces raw leaf count n inside Similarity Scores?",
        [
            "sum(p_i * (1 - p_i)) + lambda (sum of second-order Hessians plus L2 lambda)",
            "max(p_i) + 1",
            "sum(|r_i|) / 2",
            "entropy(leaf)",
        ],
        0,
        "$\\text{Similarity} = \\frac{(\\sum r_i)^2}{\\sum p_i(1 - p_i) + \\lambda}$",
        "Notice how `cover` min_child_weight constrains the denominator sum of Hessians.",
        "# min_child_weight enforces minimum Hessian sum per leaf",
    ),
    66: (
        "Why does XGBoost use a second-order Taylor expansion of the objective function?",
        [
            "Using both gradient g_i and Hessian h_i yields closed-form optimal leaf weights w* and exact split Gain formulas",
            "To convert classification into clustering",
            "To skip cross-validation",
            "To avoid regularization",
        ],
        0,
        "$w_j^* = -\\frac{\\sum_{i\\in I_j} g_i}{\\sum_{i\\in I_j} h_i + \\lambda}$",
        "Unified g_i and h_i derivations let XGBoost handle arbitrary differentiable loss functions rapidly.",
        "# Second-order expansion: L_t ~= sum(g_i f_t(x_i) + 0.5 h_i f_t(x_i)^2) + Omega(f_t)",
    ),
    67: (
        "Which systems optimization enables XGBoost to train rapidly on huge numeric datasets?",
        [
            "Weighted quantile sketching for approximate splits, sparsity-aware default branch directions, and cache-aware column blocks",
            "Evaluating every exact value across unindexed strings",
            "Training all boosting rounds purely asynchronously without residuals",
            "Storing trees solely on CPU L1 registers",
        ],
        0,
        "Approximate Quantile Sketching + Sparsity-Aware Split Finding",
        "Histogram/quantile sketches and missing-value default routing slash split scan time by orders of magnitude.",
        "# Tree methods like 'hist' bin continuous features cleanly",
    ),
    68: (
        "Why pass `early_stopping_rounds` and `eval_set` when training XGBoost in Python?",
        [
            "To halt boosting cleanly when validation metrics plateau, optimizing both accuracy and training runtime",
            "To shuffle feature columns each epoch",
            "To convert sparse matrices into dense strings",
            "To set learning_rate equal to 1.0",
        ],
        0,
        "`XGBClassifier(early_stopping_rounds=10, eval_metric='aucpr')`",
        "Validating per round stops overfitting automatically before excessive trees accumulate.",
        "# model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=False)",
    ),
    69: (
        "What target-leakage problem does CatBoost solve via Ordered Target Statistics?",
        [
            "Computes categorical target encodings sequentially using random permutations of only preceding rows, eliminating target shift",
            "Replaces categorical strings with random noise",
            "Uses L1 penalties instead of trees",
            "Runs PCA before one-hot encoding",
        ],
        0,
        "$\\text{Ordered Encoding: } \\frac{\\sum_{j < i, c_j = c_i} y_j + a \\cdot p}{\\text{count}_{j < i} + a}$",
        "Random permutation prefix averages prevent prediction shift bias during boosting.",
        "# Ordered Boosting prevents target leakage inside categorical tree splits",
    ),
    70: (
        "What distinctive symmetric structure do CatBoost's oblivious decision trees use at every depth level?",
        [
            "Every node at the same depth tests the exact same feature and split threshold, yielding ultra-fast vectorized inference and strong regularization",
            "Every branch has wildly unbalanced arbitrary depths",
            "Nodes split using neural layers",
            "Leaves output unscaled target IDs",
        ],
        0,
        "Oblivious (Symmetric) Trees: 1 shared split rule per level",
        "Shared depth rules reduce variance and allow bitwise indexing at prediction time.",
        "# Symmetric trees execute branchless SIMD evaluation cleanly",
    ),
    71: (
        "When comparing two vectors via Cosine Similarity, what geometric property are we ignoring?",
        [
            "Vector magnitudes / lengths (comparing only the cosine of the angle between directions)",
            "Angle orientation between embeddings",
            "Dot product sign",
            "Feature alignment",
        ],
        0,
        "$\\cos(\\theta) = \\frac{A \\cdot B}{\\|A\\|_2 \\|B\\|_2} \\in [-1, 1]$",
        "Cosine similarity compares direction independently of document length or scaling magnitude.",
        "import numpy as np\ndef cosine_sim(a, b): return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))",
    ),
    72: (
        "In a Soft-Margin Support Vector Machine (SVM), what are Support Vectors?",
        [
            "The training samples lying on or inside the margin edges that directly define hyperplane position",
            "Principal component eigenvectors",
            "Cluster medoids in DBSCAN",
            "All hidden neurons in layer 2",
        ],
        0,
        "$\\min \\frac{1}{2}\\|w\\|^2 + C \\sum \\xi_i$",
        "Only margin-boundary and margin-violating samples govern the SVM hyperplane; far-away points can move without changing the boundary.",
        "from sklearn.svm import SVC\nsvm = SVC(C=1.0, kernel='linear').fit(X_scaled, y)",
    ),
    73: (
        "How does the Polynomial Kernel `(a * b + r)^d` empower SVMs without explicitly exploding feature dimensions?",
        [
            "The Kernel Trick computes high-dimensional inner products directly from original low-dimensional inputs",
            "It drops polynomial features above degree 1",
            "It replaces labels with continuous means",
            "It runs Decision Trees on residuals",
        ],
        0,
        "$K(x, z) = (\\gamma x^T z + r)^d$",
        "Evaluating kernel similarity avoids explicitly constructing huge combinatorial polynomial vectors.",
        "svm_poly = SVC(kernel='poly', degree=3, C=1.0).fit(X_scaled, y)",
    ),
    74: (
        "How does the Radial Basis Function (RBF) Gaussian Kernel behave mathematically?",
        [
            "Measures local proximity exp(-gamma * ||x - z||^2), effectively projecting into an infinite-dimensional similarity space",
            "Always fits a flat hyperplane in raw coordinates",
            "Computes cosine angles normalized by L1 length",
            "Builds symmetric oblivious trees",
        ],
        0,
        "$K(x, z) = \\exp(-\\gamma \\|x - z\\|_2^2)$",
        "Points close in input space influence predictions strongly, enabling flexible non-linear decision regions.",
        "svm_rbf = SVC(kernel='rbf', gamma='scale', C=1.0).fit(X_scaled, y)",
    ),
    75: (
        "Why must numerical inputs be standardized (`StandardScaler`) before fitting RBF/Polynomial SVMs with `GridSearchCV`?",
        [
            "Euclidean distances ||x - z||^2 and regularization C assume comparable scales across features",
            "SVMs crash on negative numbers",
            "SVMs require integer-only inputs",
            "GridSearchCV drops unscaled matrices",
        ],
        0,
        "Pipeline: `make_pipeline(StandardScaler(), SVC())`",
        "Unscaled high-magnitude features skew Euclidean distances in the RBF kernel exponentially.",
        "from sklearn.model_selection import GridSearchCV\ngs = GridSearchCV(make_pipeline(StandardScaler(), SVC()), {'svc__C': [0.1, 1, 10]})",
    ),
    76: (
        "How do weighted hidden-layer nodes + non-linear activation functions enable Neural Networks to fit curvy functions?",
        [
            "Weighted combinations scale and shift non-linear activations, summing basis curves to approximate arbitrary shapes",
            "Stacked linear layers without activation already produce curves",
            "Weights are fixed permanently to 1",
            "Softmax runs inside every hidden layer",
        ],
        0,
        "$\\hat{y} = \\sum_k w_k \\,\\phi(a_k x + b_k) + c$",
        "Non-linear activations break linear collapse, letting shallow/deep layers compose curved approximations.",
        "import torch.nn as nn\nnet = nn.Sequential(nn.Linear(4, 16), nn.ReLU(), nn.Linear(16, 1))",
    ),
    77: (
        "What is Backpropagation's core goal during Neural Network training?",
        [
            "Propagates loss gradients backward from output to earlier layers using the Chain Rule so optimizers can update weights and biases",
            "Trains decision trees inside hidden layers",
            "Randomly flips class labels each epoch",
            "Computes PCA eigenvalues on test inputs",
        ],
        0,
        "$\\delta^{(l)} = (W^{(l+1)T} \\delta^{(l+1)}) \\odot \\phi'(z^{(l)})$",
        "Backpropagation efficiently reuses downstream gradients so every weight receives exact gradient updates in one backward sweep.",
        "# loss.backward(); optimizer.step()",
    ),
    78: (
        "When optimizing biases and weights simultaneously in Backpropagation, how are partial derivatives with respect to multiple parameters combined?",
        [
            "Independent partial derivatives are evaluated along each parameter path and applied together as a gradient vector step",
            "Only one parameter updates per year while all others stay frozen forever",
            "Biases always equal zero",
            "Gradients are averaged into a single scalar applied uniformly to all weights",
        ],
        0,
        "$\\nabla \\mathcal{L} = \\left[\\frac{\\partial \\mathcal{L}}{\\partial w_1}, \\dots, \\frac{\\partial \\mathcal{L}}{\\partial b}\\right]$",
        "Gradient vectors update all weights and biases simultaneously along steepest descent.",
        "optimizer.zero_grad(); loss.backward(); optimizer.step()",
    ),
    79: (
        "When a weight or bias feeds multiple downstream paths in a Neural Network, how does the Chain Rule compute its total gradient?",
        [
            "Sums the chain-rule gradient contributions flowing backward across all outgoing branches",
            "Takes only the maximum gradient branch and discards others",
            "Multiplies branches together before taking logs",
            "Sets all shared parameter gradients to zero",
        ],
        0,
        "$\\frac{\\partial \\mathcal{L}}{\\partial p} = \\sum_{k} \\frac{\\partial \\mathcal{L}}{\\partial a_k} \\frac{\\partial a_k}{\\partial p}$",
        "Multivariable chain rule sums partial paths whenever a single node fans out to multiple paths.",
        "# PyTorch autograd accumulates fan-out partial sums automatically",
    ),
    80: (
        "Why is ReLU(x) = max(0, x) one of the most widely used hidden activations in deep neural networks?",
        [
            "Simple piecewise linearity bends curves without vanishing gradient saturation for positive activations",
            "Its derivative is zero everywhere",
            "It maps outputs strictly into probabilities summing to 1",
            "It forces all weights to be symmetric",
        ],
        0,
        "$\\text{ReLU}(x) = \\max(0, x)$",
        "ReLU maintains unit gradient for x > 0, accelerating deep convergence relative to saturating sigmoids.",
        "def relu(x): return np.maximum(0, x)",
    ),
    81: (
        "In a Multi-Class Neural Network with multiple output nodes, why use one-hot output vectors alongside hidden layer mixing?",
        [
            "Each input node fans out to hidden neurons that combine evidence across shared features toward each output class logit",
            "Hidden nodes must always equal exact input dimension",
            "Because matrices cannot multiply vectors of unequal width",
            "To convert classification into K-Means",
        ],
        0,
        "$z^{(2)} = W^{(2)} \\text{ReLU}(W^{(1)} x + b^{(1)}) + b^{(2)}$",
        "Shared hidden representations efficiently extract multi-class evidence across multiple output logits.",
        "logits = W2 @ np.maximum(0, W1 @ x + b1) + b2",
    ),
    82: (
        "Why do neural classifiers pair SoftMax during training instead of ArgMax directly?",
        [
            "ArgMax has zero gradient almost everywhere and cannot backpropagate, whereas SoftMax is smooth, differentiable, and sums to 1",
            "SoftMax always returns hard 0/1 integers",
            "ArgMax is slower than SVD",
            "SoftMax requires positive inputs only",
        ],
        0,
        "$\\text{Softmax}(z)_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}$",
        "SoftMax transforms logits into a smooth probability simplex compatible with gradient descent.",
        "def softmax(z):\n    e = np.exp(z - np.max(z))\n    return e / e.sum()",
    ),
    83: (
        "Why does computing the SoftMax derivative with Cross-Entropy yield such an elegant gradient expression?",
        [
            "The derivative simplifies cleanly to (predicted_probability - true_one_hot_label), i.e., p_k - y_k",
            "It explodes exponentially with batch size",
            "It requires Hessian inversion",
            "It vanishes identically whenever p_k != y_k",
        ],
        0,
        "$\\frac{\\partial \\mathcal{L}_{\\text{CE}}}{\\partial z_k} = p_k - y_k$",
        "The clean p_k - y_k residual matches the intuitive error direction directly in logit space.",
        "# dL/dz = probs - y_one_hot",
    ),
    84: (
        "What does Cross-Entropy Loss heavily penalize compared to Mean Squared Error on SoftMax outputs?",
        [
            "Confident wrong predictions (when true class predicted probability p -> 0, -log(p) shoots toward infinity)",
            "Near-perfect correct predictions",
            "Uniform probabilities when classes are ambiguous",
            "Weight decay terms",
        ],
        0,
        "$\\mathcal{L}_{\\text{CE}} = -\\sum_c y_c \\log(p_c)$",
        "Cross-Entropy steepens gradients dramatically when a classifier is confidently wrong, avoiding sigmoid/softmax plateaus.",
        "import torch.nn.functional as F\nloss = F.cross_entropy(logits, target_indices)",
    ),
    85: (
        "In Neural Networks Part 7, what happens to backpropagation step updates at output layer logits under Cross-Entropy?",
        [
            "Error signals scale directly proportional to (p - y), propagating cleanly back through SoftMax logits",
            "All gradients become positive constants regardless of label",
            "Hidden weights never update",
            "Learning rate switches sign automatically",
        ],
        0,
        "$\\nabla_{W_{\\text{out}}} \\mathcal{L} = (p - y) h^T$",
        "Backprop combines the clean p - y logit gradient with upstream hidden activations via outer product.",
        "# grad_W_out = np.outer(probs - y_true_onehot, hidden_acts)",
    ),
    86: (
        "Why do Convolutional Neural Networks (CNNs) preserve spatial image patterns better than flattening into a Dense MLP?",
        [
            "Sliding small weight-shared filters + pooling capture local edges/shapes translation-invariantly with far fewer parameters",
            "Convolutions ignore neighboring pixels intentionally",
            "Pooling doubles image resolution",
            "CNNs use Decision Trees as filters",
        ],
        0,
        "2D Convolution + ReLU + Max Pooling -> Spatial Feature Maps",
        "Parameter-shared convolutional kernels detect features regardless of where they appear across an image.",
        "conv = nn.Conv2d(in_channels=1, out_channels=16, kernel_size=3, padding=1)",
    ),
    87: (
        "How do Recurrent Neural Networks (RNNs) handle variable-length sequences (like text or time series)?",
        [
            "Pass a hidden state vector forward across time steps, sharing weights at each sequence step",
            "Require every input sentence to have identical fixed pixel dimensions",
            "Compute PCA on every single word separately",
            "Run K-Means over hidden layers",
        ],
        0,
        "$h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h)$",
        "Weight-sharing recurrence captures temporal order across variable sequence lengths, though vanilla RNNs struggle with long horizons.",
        "rnn = nn.RNN(input_size=16, hidden_size=32, batch_first=True)",
    ),
    88: (
        "Why do LSTMs overcome the vanishing/exploding gradient problem of vanilla RNNs?",
        [
            "Separate Long-Term Cell State updated additively via Forget, Input, and Output gates preserves long-range gradient flow",
            "LSTMs remove all activation functions completely",
            "LSTMs never share weights across steps",
            "LSTMs sort sequences alphabetically",
        ],
        0,
        "$C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t$",
        "The additive gated cell state highway protects long-term memory from repeated multiplicative gradient decay.",
        "lstm = nn.LSTM(input_size=16, hidden_size=32, batch_first=True)",
    ),
    89: (
        "What do Word Embeddings / Word2Vec represent compared to sparse one-hot word vectors?",
        [
            "Dense low-dimensional learned vectors where words appearing in similar contexts occupy nearby geometric directions",
            "Sparse million-dimensional binary orthogonal vectors",
            "Random hashes fixed without training",
            "Alphabetical character counts",
        ],
        0,
        "Dense Embedding Matrix $E \\in \\mathbb{R}^{|V| \\times d}$",
        "Predicting context words via CBOW/Skip-Gram maps semantic analogies into vector geometry.",
        "emb = nn.Embedding(num_embeddings=10000, embedding_dim=128)",
    ),
    90: (
        "How does a Sequence-to-Sequence (Seq2Seq) Encoder-Decoder translate variable input lengths to different output lengths?",
        [
            "Encoder compresses source tokens into context state; Decoder unrolls target tokens step-by-step until <EOS>",
            "Maps each word 1-to-1 strictly at equal length",
            "Drops hidden states after token 1",
            "Uses Logistic Regression per character",
        ],
        0,
        "Encoder $x_{1..T} \\to c \\to$ Decoder $y_{1..T'}$",
        "Decoupling encoding from autoregressive decoding lets input and output lengths differ cleanly.",
        "# Decoder feeds <SOS> and previous token embeddings until <EOS>",
    ),
    91: (
        "How did Attention fix the bottleneck of classic fixed-vector Seq2Seq models?",
        [
            "Allows the decoder at every output step to compute dynamic weighted similarities across ALL encoder states simultaneously",
            "Truncates long sentences to 5 words",
            "Replaces neural layers with Random Forests",
            "Freezes encoder weights before training",
        ],
        0,
        "Context $c_t = \\sum_s \\alpha_{ts} h_s$ via SoftMax scores",
        "Dynamic soft alignment avoids cramming an entire source document into a single final hidden vector.",
        "attn_weights = torch.softmax(scores, dim=-1)",
    ),
    92: (
        "What core innovation lets Transformer Neural Networks train vastly faster than RNNs/LSTMs?",
        [
            "Self-Attention + Positional Encoding processes all tokens in parallel without sequential step-by-step recurrence",
            "Transformers eliminate all matrix multiplications",
            "Transformers train strictly 1 token per minute sequentially",
            "Transformers only use linear regression",
        ],
        0,
        "$\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$",
        "Parallel token interaction via scaled dot-product Self-Attention removes sequential recurrence bottlenecks.",
        "scores = (Q @ K.transpose(-2, -1)) / (d_k ** 0.5)",
    ),
    93: (
        "Why do Decoder-Only Transformers (like GPT / ChatGPT) apply Masked Self-Attention during training?",
        [
            "Masks future tokens (-inf before softmax) so predicting token t+1 can only attend to tokens 1..t cleanly",
            "Deletes positional embeddings",
            "Disables backpropagation across heads",
            "Forces outputs to match encoder-only BERT masks",
        ],
        0,
        "Causal upper-triangular mask $M_{ij} = -\\infty$ for $j > i$",
        "Causal masking preserves autoregressive next-token prediction while keeping parallel matrix training fast.",
        "mask = torch.triu(torch.ones(T, T), diagonal=1).bool()\nscores = scores.masked_fill(mask, float('-inf'))",
    ),
    94: (
        "Why are Encoder-Only Transformers (like BERT) well suited for embeddings and Retrieval-Augmented Generation (RAG) lookup?",
        [
            "Bidirectional unmasked self-attention builds rich contextual embeddings capturing full left-and-right document context",
            "They only generate audio waveforms",
            "They use causal masking to hide right context",
            "They lack dense token embeddings",
        ],
        0,
        "Masked Language Modeling (MLM): bidirectional full-context encoding",
        "Bidirectional encoders capture semantic context from surrounding tokens for retrieval and similarity search.",
        "# Encode query + documents into dense vector embeddings for similarity retrieval",
    ),
    95: (
        "In deep learning frameworks like PyTorch, what is a Tensor conceptually?",
        [
            "A generalized n-dimensional numerical array supporting GPU acceleration and automatic differentiation graphs",
            "Strictly a 1D Python list of strings",
            "A tree node impurity metric",
            "A SQLite database column type",
        ],
        0,
        "Scalar (0D) -> Vector (1D) -> Matrix (2D) -> Tensor (nD)",
        "Tensors unify batched multidimensional computation on GPUs/CPUs alongside autograd tracking.",
        "import torch\nx = torch.tensor([[1.0, 2.0], [3.0, 4.0]], requires_grad=True)",
    ),
    96: (
        "Which matrix requirement governs multiplying Matrix A (shape m x n) by Matrix B (shape p x q)?",
        [
            "Inner dimensions must match (n == p), yielding an output matrix of shape m x q",
            "Both matrices must always be square",
            "Outer dimensions must match (m == q)",
            "Matrices cannot contain negative numbers",
        ],
        0,
        "$(m \\times n) \\cdot (n \\times q) \\to (m \\times q)$",
        "Row-column dot products require matching inner dimensions n == p.",
        "C = A @ B  # torch.matmul(A, B)",
    ),
    97: (
        "Why does Transformer Scaled Dot-Product Attention divide Q K^T by sqrt(d_k)?",
        [
            "Large dimensions d_k increase dot-product variance, which would push SoftMax into saturated flat gradients without 1/sqrt(d_k) scaling",
            "To double learning rates automatically",
            "To make Q and K orthogonal matrices",
            "To convert tensors into numpy strings",
        ],
        0,
        "$\\text{Var}(q \\cdot k) = d_k \\implies \\text{divide by } \\sqrt{d_k}$ keeps unit variance",
        "Rescaling preserves moderate logits before softmax so gradients stay healthy across large head dimensions.",
        "attn = torch.softmax((Q @ K.transpose(-2, -1)) / math.sqrt(Q.size(-1)), dim=-1) @ V",
    ),
    98: (
        "What essential steps make up a standard PyTorch training iteration (`torch.optim`)?",
        [
            "zero_grad() -> forward pass & loss -> loss.backward() -> optimizer.step()",
            "optimizer.step() -> forward pass -> load CSV",
            "pca.fit() -> zero_grad() -> kmeans()",
            "softmax() -> drop_table()",
        ],
        0,
        "Autograd loop: clear stale grads, forward, backward, step",
        "Zeroing gradients prevents accumulation across unrelated batches unless intentionally doing gradient accumulation.",
        "optimizer.zero_grad()\nloss = loss_fn(model(x), y)\nloss.backward()\noptimizer.step()",
    ),
    99: (
        "What boilerplate does PyTorch Lightning cleanly automate over raw PyTorch loops?",
        [
            "Training/validation loops, device/GPU placement, logging, checkpointing, and learning rate schedulers via `LightningModule`",
            "Replaces tensors with decision trees",
            "Removes activation functions",
            "Forces models onto CPU only",
        ],
        0,
        "`class Model(L.LightningModule): def training_step(...)`",
        "Lightning separates research math from hardware orchestration and boilerplate loops.",
        "# trainer = L.Trainer(max_epochs=10); trainer.fit(model, dataloader)",
    ),
    100: (
        "When implementing an LSTM module in PyTorch (`nn.LSTM`), what do the two returned tuple items represent?",
        [
            "Full sequence hidden states output AND final `(h_n, c_n)` hidden/cell state tuple",
            "Mean and standard deviation of weights",
            "Train accuracy and test accuracy",
            "Encoder and decoder optimizers",
        ],
        0,
        "`out, (h_n, c_n) = self.lstm(x)`",
        "Using `h_n[-1]` extracts the final summary hidden representation for sequence-level predictions.",
        "out, (h_n, c_n) = nn.LSTM(1, 16, batch_first=True)(seq)",
    ),
    101: (
        "How does `nn.Embedding` function inside PyTorch NLP / Word Embedding models?",
        [
            "Acts as a fast differentiable lookup table mapping integer token IDs directly to trainable dense row vectors",
            "Trains a separate Logistic Regression per word sequentially",
            "Runs DBSCAN over vocabulary strings",
            "Applies 2D convolutions to raw UTF-8 strings",
        ],
        0,
        "`emb = nn.Embedding(vocab_size, embed_dim)`",
        "Embedding indexing performs exact linear projection of sparse one-hot IDs cleanly and efficiently.",
        "token_vecs = nn.Embedding(1000, 64)(torch.tensor([3, 14, 7]))",
    ),
    102: (
        "When coding a Decoder-Only ChatGPT-like Transformer from scratch in PyTorch, what components repeat in each block?",
        [
            "Token + Positional Embeddings -> Masked Multi-Head Self-Attention + Residual + Feed-Forward MLP + Output Vocab Linear Head",
            "Convolution -> MaxPool -> K-Means",
            "Decision Stump -> Gini Split -> Sigmoid",
            "SVD -> Scree Plot -> Ridge",
        ],
        0,
        "Decoder Block: TokenEmb + PosEmb + Causal Attention + Linear Head",
        "Combining embeddings, causal masked attention, residuals, and vocabulary logits produces an autoregressive LM.",
        "# logits = self.fc_out(attn_out + x_emb)",
    ),
    103: (
        "What does the Discount Factor gamma in [0, 1) balance in Reinforcement Learning?",
        [
            "Balances immediate rewards against discounted expected future rewards across trajectories",
            "Limits learning rate decay per neuron",
            "Controls L1 sparsity in Ridge Regression",
            "Sets K in K-Nearest Neighbors",
        ],
        0,
        "$G_t = R_{t+1} + \\gamma R_{t+2} + \\gamma^2 R_{t+3} + \\dots$",
        "Smaller gamma values prioritize short-term rewards; values close to 1 plan far into future states.",
        "G = reward + gamma * next_value",
    ),
    104: (
        "Why do Deep Reinforcement Learning agents (like DQN / Policy Networks) pair Neural Networks with RL environments?",
        [
            "Tabular Q-tables explode across huge/continuous state spaces, whereas Neural Nets approximate Policy/Value functions cleanly",
            "Because neural networks require zero rewards",
            "To convert MDPs into OLS regression",
            "To disable exploration completely",
        ],
        0,
        "Deep Policy / Value Approximator: $\\pi_\\theta(a\\mid s)$ or $Q_\\theta(s, a)$",
        "Function approximation generalizes across continuous or combinatorial state spaces.",
        "# policy_probs = torch.softmax(policy_net(state), dim=-1)",
    ),
    105: (
        "In Policy Gradient / REINFORCE RL training, how do action log-probabilities combine with observed advantage / rewards?",
        [
            "Gradient ascent nudges parameters along reward * grad(log pi(a|s)), reinforcing actions with positive outcomes",
            "Minimizes MSE against constant 1.0 regardless of reward",
            "Drops states with positive reward",
            "Computes Gini impurity over actions",
        ],
        0,
        "$\\nabla_\\theta J(\\theta) = \\mathbb{E}\\left[G_t \\nabla_\\theta \\log \\pi_\\theta(A_t \\mid S_t)\\right]$",
        "Scaling log-action gradients by returns raises probabilities of high-reward actions and lowers poor ones.",
        "loss = -(log_prob * advantage).mean()",
    ),
    106: (
        "What are the three canonical stages of Reinforcement Learning with Human Feedback (RLHF) for aligning LLMs?",
        [
            "1) Supervised Fine-Tuning (SFT) -> 2) Train Reward Model from Human Comparisons -> 3) Optimize Policy via PPO + KL-penalty",
            "1) PCA -> 2) K-Means -> 3) Ridge Regression",
            "1) Train CNN -> 2) Prune Tree -> 3) DBSCAN",
            "1) Zero weights -> 2) Remove attention -> 3) ArgMax",
        ],
        0,
        "$\\max_\\theta \\mathbb{E}[r_\\phi(x, y) - \\beta D_{\\text{KL}}(\\pi_\\theta \\parallel \\pi_{\\text{SFT}})]$",
        "RLHF fits a Reward Model on human preference rankings and tunes the LLM policy via PPO with a KL divergence anchor to prevent reward hacking.",
        "# reward_loss = -torch.log(torch.sigmoid(r_chosen - r_rejected)).mean()",
    ),
}


def _difficulty_for_order(order: int) -> str:
    if order <= 29:
        return "Beginner"
    if order <= 75:
        return "Intermediate"
    return "Advanced"


def _parse_duration_minutes(dur_str: str) -> int:
    parts = [int(p) for p in dur_str.split(":") if p.isdigit()]
    if len(parts) == 3:
        return max(1, parts[0] * 60 + parts[1] + (1 if parts[2] >= 30 else 0))
    if len(parts) == 2:
        return max(1, parts[0] + (1 if parts[1] >= 30 else 0))
    return 10


def _build_notes_markdown(order: int, title: str, mod: Dict[str, Any], concept: str, explanation: str) -> str:
    return f"""### Lecture {order} Study Notes — {title}

**Module {mod['order']}:** {mod['title']}

#### Core Concept & Mathematical Formulation
{concept}

#### Key Engineering Takeaways
- {explanation}
- Understand when assumptions hold (scaling, linearity, independence, regularization, or attention complexity) before choosing hyperparameters in production.
- Pair intuition from the StatQuest visual walkthrough with reproducible validation metrics (CV score, ROC/PR-AUC, or loss curves) using held-out test folds.

#### Practical Checklist Before Moving On
1. Review the formula above and trace what happens at boundary cases (small datasets, correlated features, or large regularization).
2. Inspect the starter Python snippet below to verify scikit-learn / NumPy / PyTorch API usage.
3. Complete the **After-Video Comprehension Quiz** below to unlock `+10 XP` and track course mastery.
"""


@lru_cache(maxsize=1)
def _load_raw_playlist() -> List[Dict[str, Any]]:
    data_path = Path(__file__).resolve().parent / "ml_playlist_data.json"
    with data_path.open("r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def get_ml_course_catalog() -> Dict[str, Any]:
    raw_items = _load_raw_playlist()
    lessons: List[Dict[str, Any]] = []
    module_counts: Dict[str, int] = {m["id"]: 0 for m in MODULES}

    for entry in raw_items:
        order = int(entry["order"])
        vid = entry["video_id"]
        title = entry["title"]
        dur_label = entry.get("duration") or "10:00"
        mod = _module_for_order(order)
        module_counts[mod["id"]] += 1

        spec = LESSON_QUIZ_SPECS[order]
        q_text, options, correct_idx, concept, explanation, code_snippet = spec

        lesson_id = f"ml-{order:03d}"
        lessons.append(
            {
                "id": lesson_id,
                "order": order,
                "video_id": vid,
                "title": title,
                "module_id": mod["id"],
                "module_order": mod["order"],
                "module_title": mod["title"],
                "difficulty": _difficulty_for_order(order),
                "duration_label": dur_label,
                "duration_minutes": _parse_duration_minutes(dur_label),
                "video_url": f"https://www.youtube.com/embed/{vid}?rel=0",
                "youtube_watch_url": f"https://www.youtube.com/watch?v={vid}&list={PLAYLIST_ID}",
                "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                "notes_markdown": _build_notes_markdown(order, title, mod, concept, explanation),
                "key_formula": concept,
                "code_snippet": code_snippet,
                "quiz": {
                    "id": f"quiz-{order:03d}",
                    "lesson_id": lesson_id,
                    "lesson_order": order,
                    "lesson_title": title,
                    "module_id": mod["id"],
                    "module_title": mod["title"],
                    "question": q_text,
                    "options": options,
                    "correct_index": correct_idx,
                    "explanation": explanation,
                },
            }
        )

    modules_out = [
        {
            "id": m["id"],
            "order": m["order"],
            "title": m["title"],
            "lesson_start": m["range"][0],
            "lesson_end": m["range"][1],
            "lesson_count": module_counts[m["id"]],
        }
        for m in MODULES
    ]

    return {
        "id": COURSE_ID,
        "title": COURSE_TITLE,
        "playlist_id": PLAYLIST_ID,
        "playlist_url": PLAYLIST_URL,
        "instructor": COURSE_INSTRUCTOR,
        "total_lessons": len(lessons),
        "total_quizzes": len(lessons),
        "modules": modules_out,
        "lessons": lessons,
    }


def get_lesson_by_id(lesson_id: str) -> Optional[Dict[str, Any]]:
    catalog = get_ml_course_catalog()
    for lesson in catalog["lessons"]:
        if lesson["id"] == lesson_id or str(lesson["order"]) == lesson_id:
            return lesson
    return None


def get_100_quiz_bank(include_answers: bool = False) -> List[Dict[str, Any]]:
    """Return 100-question (or full 106) post-video mastery quiz bank."""
    catalog = get_ml_course_catalog()
    items: List[Dict[str, Any]] = []
    for lesson in catalog["lessons"]:
        q = dict(lesson["quiz"])
        if not include_answers:
            q.pop("correct_index", None)
            q.pop("explanation", None)
        items.append(q)
    return items


# Curated 30 high-signal lecture indices spanning all 7 modules for the Proctored Final Exam
FINAL_EXAM_LESSON_ORDERS = [
    1, 2, 3, 6, 7,          # Module 1: CV, Confusion Matrix, Bias-Variance, Entropy
    10, 14, 16, 23, 25, 26, # Module 2: Linear Reg, Log-Odds, Logistic, ROC/AUC, Ridge, Lasso
    30, 35, 39, 41, 42,     # Module 3: PCA, LDA, t-SNE, K-Means, DBSCAN
    44, 46, 50, 52,         # Module 4: Naive Bayes, Decision Trees, Target Encoding, Random Forest
    56, 59, 64, 71, 74,     # Module 5: Gradient Descent, Grad Boost, XGBoost, Cosine, SVM RBF
    77, 82, 84, 86, 88,     # Module 6: Backprop, Softmax, Cross-Entropy, CNN, LSTM
    92, 93, 97, 102, 106,   # Module 7: Transformers, Causal Masking, Scaling sqrt(dk), GPT PyTorch, RLHF
]


def get_final_exam_questions(include_answers: bool = False) -> List[Dict[str, Any]]:
    """Return 35 comprehensive proctored exam questions across all 7 ML modules."""
    catalog = get_ml_course_catalog()
    by_order = {l["order"]: l for l in catalog["lessons"]}
    questions: List[Dict[str, Any]] = []
    for idx, order in enumerate(FINAL_EXAM_LESSON_ORDERS, start=1):
        lesson = by_order[order]
        q = dict(lesson["quiz"])
        q["exam_number"] = idx
        if not include_answers:
            q.pop("correct_index", None)
            q.pop("explanation", None)
        questions.append(q)
    return questions
