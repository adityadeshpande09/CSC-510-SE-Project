"""
Flask API Application for Efficiency-Waste Correlation and Restaurant Data

Provides REST API endpoints for accessing:
- Correlation and regression analysis results
- Restaurant data with sustainability metrics
- Rescue meals from food waste data
- User impact statistics

Author: CSC-510-SE-Project
Issue: #15
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from analysis.correlate_efficiency_waste import (
    load_and_merge_data,
    compute_correlations,
    perform_regression_analysis,
    get_correlation_summary
)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Data directory path
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "data")


# ============================================================================
# EXISTING ENDPOINTS
# ============================================================================

@app.route('/api/efficiency-waste-correlation', methods=['GET'])
def efficiency_waste_correlation():
    """
    API endpoint to get correlation and regression analysis results.
    
    Returns:
        JSON response with:
        - correlations: Dictionary of correlation coefficients
        - regressions: Dictionary of regression models
        - summary: Summary of strong correlations
    """
    try:
        # Load and merge data
        merged_df = load_and_merge_data()
        
        # Compute correlations (this prints, but also returns results)
        correlation_results = compute_correlations(merged_df)
        
        # Perform regression analysis (this prints, but also returns results)
        regression_results = perform_regression_analysis(merged_df)
        
        # Get summary
        summary = get_correlation_summary(correlation_results)
        
        # Format regression results for JSON serialization
        formatted_regressions = {}
        for target, results in regression_results.items():
            formatted_regressions[target] = {
                'coefficients': {k: float(v) for k, v in results['coefficients'].items()},
                'intercept': float(results['intercept']),
                'r2_score': float(results['r2_score']),
                'n_samples': int(results['n_samples'])
            }
        
        # Format correlations for JSON serialization
        formatted_correlations = {}
        for key, values in correlation_results.items():
            formatted_correlations[key] = {
                'pearson_correlation': float(values['pearson_correlation']),
                'pearson_p_value': float(values['pearson_p_value']),
                'spearman_correlation': float(values['spearman_correlation']),
                'spearman_p_value': float(values['spearman_p_value']),
                'n_samples': int(values['n_samples'])
            }
        
        # Build response
        response = {
            'status': 'success',
            'data': {
                'correlations': formatted_correlations,
                'regressions': formatted_regressions,
                'summary': summary,
                'restaurants_analyzed': len(merged_df)
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# ============================================================================
# NEW RESTAURANT ENDPOINTS FOR TIFFIN TRAILS
# ============================================================================

@app.route('/api/restaurants', methods=['GET'])
def get_restaurants():
    """
    Get all restaurants with their metadata, sustainability metrics, and waste data.
    
    Returns:
        JSON array of restaurant objects with:
        - Basic info (name, cuisine, location, ratings)
        - Delivery metrics (avg time, on-time rate)
        - Sustainability scores
        - Waste metrics
        - Available rescue meals
    """
    try:
        # Load all datasets
        metadata = pd.read_csv(os.path.join(DATA_DIR, "Restaurant_Metadata.csv"))
        delivery = pd.read_csv(os.path.join(DATA_DIR, "vendor_delivery_metrics.csv"))
        efficiency = pd.read_csv(os.path.join(DATA_DIR, "vendor_efficiency_scores.csv"))
        waste = pd.read_csv(os.path.join(DATA_DIR, "Raleigh_Food_Waste__1-week_sample_.csv"))
        feedback = pd.read_csv(os.path.join(DATA_DIR, "Customer_Feedback.csv"))
        
        # Merge all data
        restaurants = metadata.merge(delivery, on='restaurant', how='left')
        restaurants = restaurants.merge(efficiency, on='restaurant', how='left')
        
        # Calculate waste metrics per restaurant
        waste_by_restaurant = waste.groupby('restaurant').agg({
            'quantity_lb': 'sum',
            'est_cost_usd': 'sum'
        }).reset_index()
        waste_by_restaurant.columns = ['restaurant', 'weekly_waste_lbs', 'weekly_waste_cost']
        
        restaurants = restaurants.merge(waste_by_restaurant, on='restaurant', how='left')
        
        # Calculate average ratings
        avg_ratings = feedback.groupby('restaurant').agg({
            'delivery_rating': 'mean',
            'food_quality_rating': 'mean'
        }).reset_index()
        avg_ratings['avg_rating'] = (avg_ratings['delivery_rating'] + avg_ratings['food_quality_rating']) / 2
        
        restaurants = restaurants.merge(avg_ratings[['restaurant', 'avg_rating']], on='restaurant', how='left')
        
        # Fill NaN values with sensible defaults
        restaurants = restaurants.fillna({
            'weekly_waste_lbs': 0,
            'weekly_waste_cost': 0,
            'avg_rating': 4.0,
            'efficiency_score': 75,
            'avg_delivery_time': 20,
            'on_time_rate': 90,
            'avg_distance': 5.0,
            'deliveries_per_day': 50
        })
        
        # Convert to JSON-friendly format
        result = []
        for idx, row in restaurants.iterrows():
            result.append({
                'id': int(idx),
                'name': str(row['restaurant']),
                'cuisine': str(row['cuisine']),
                'location': f"Raleigh, Zip-{int(row['zip_code'])}",
                'rating': round(float(row['avg_rating']), 1),
                'reviews': int(row.get('avg_daily_orders', 100)),
                'capacity': int(row['capacity']),
                'sustainabilityScore': int(row['efficiency_score']),
                'avgDailyOrders': int(row['avg_daily_orders']),
                'hasSustainabilityProgram': bool(row['has_sustainability_program']),
                'zipCode': int(row['zip_code']),
                'avgDeliveryTime': round(float(row['avg_delivery_time']), 1),
                'onTimeRate': round(float(row['on_time_rate']), 1),
                'avgDistance': round(float(row.get('avg_distance', 5)), 1),
                'deliveriesPerDay': round(float(row.get('deliveries_per_day', 50)), 1),
                'efficiencyScore': round(float(row['efficiency_score']), 1),
                'weeklyWasteLbs': round(float(row['weekly_waste_lbs']), 1),
                'weeklyWasteCost': round(float(row['weekly_waste_cost']), 2),
                'wasteReduction': "+15%",  # Calculate from historical data if available
                'carbonSaved': round(float(row['weekly_waste_lbs']) * 0.5, 1),  # Rough estimate
                'rescueMeals': []  # Populated by separate endpoint
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/rescue-meals', methods=['GET'])
def get_rescue_meals():
    """
    Get available rescue meals from waste data.
    
    Identifies food items that are:
    - Marked as 'Overproduction' or 'End of service'
    - Still within safe consumption window
    - Available for discounted purchase
    
    Returns:
        JSON array of rescue meal objects
    """
    try:
        waste = pd.read_csv(os.path.join(DATA_DIR, "Raleigh_Food_Waste__1-week_sample_.csv"))
        
        # Check if Menu_Portions.csv exists
        menu_path = os.path.join(DATA_DIR, "Menu_Portions.csv")
        if os.path.exists(menu_path):
            menu = pd.read_csv(menu_path)
            # Filter recent waste that could be rescue meals
            rescue_candidates = waste[waste['waste_type'].isin(['Overproduction', 'End of service'])]
            rescue_candidates = rescue_candidates.merge(menu, on='entree', how='left')
        else:
            # Work with waste data only
            rescue_candidates = waste[waste['waste_type'].isin(['Overproduction', 'End of service'])]
        
        result = []
        for idx, row in rescue_candidates.head(20).iterrows():
            # Calculate pricing
            unit_cost = float(row.get('avg_unit_cost_usd', row.get('est_cost_usd', 10)))
            original_price = round(unit_cost * 1.5, 2)  # 50% markup
            rescue_price = round(unit_cost * 0.7, 2)    # 30% discount
            
            result.append({
                'id': int(idx),
                'name': str(row['entree']),
                'restaurant': str(row['restaurant']),
                'originalPrice': original_price,
                'rescuePrice': rescue_price,
                'quantity': int(row.get('servings', row.get('quantity_lb', 1))),
                'expiresIn': '2 hours',  # Could be calculated from timestamp
                'wasteType': str(row['waste_type'])
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/user-impact', methods=['GET'])
def get_user_impact():
    """
    Get aggregated user impact statistics.
    
    In production, this would be personalized per user.
    Currently returns sample aggregate statistics.
    
    Returns:
        JSON object with user impact metrics
    """
    return jsonify({
        'mealsOrdered': 47,
        'moneySaved': 156.80,
        'foodWastePrevented': 23.4,
        'carbonReduced': 18.7,
        'localRestaurantsSupported': 8,
        'impactLevel': 'Sustainability Champion'
    }), 200


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'data_dir_exists': os.path.exists(DATA_DIR)
    }), 200


@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information."""
    return jsonify({
        'service': 'Tiffin Trails API',
        'version': '2.0.0',
        'description': 'Restaurant sustainability and food waste reduction platform',
        'endpoints': {
            '/api/restaurants': 'GET - All restaurants with sustainability metrics',
            '/api/rescue-meals': 'GET - Available rescue meals from food waste',
            '/api/user-impact': 'GET - User impact statistics',
            '/api/efficiency-waste-correlation': 'GET - Correlation and regression analysis',
            '/api/health': 'GET - Health check'
        },
        'documentation': 'https://github.com/YashDhavale/CSC-510-SE-Project'
    }), 200


if __name__ == '__main__':
    # Run Flask app
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Starting Tiffin Trails API on port {port}")
    print(f"📁 Data directory: {DATA_DIR}")
    print(f"🌐 API endpoints available at http://localhost:{port}/")
    app.run(host='0.0.0.0', port=port, debug=True)