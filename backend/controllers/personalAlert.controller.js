const PersonalAlertService = require('../services/personalAlert.service');

class PersonalAlertController {
  static async getPersonalAnalysis(req, res) {
    try {
      const userId = req.user.id;
      const analysis = await PersonalAlertService.analyzePersonalData(userId);
      
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al analizar datos personales',
        error: error.message
      });
    }
  }
}

module.exports = PersonalAlertController; 