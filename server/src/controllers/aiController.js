const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Validate API key
if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required');
}

// Add error handling for model initialization
let model;
try {
  model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
} catch (error) {
  console.error('Failed to initialize Gemini model:', error);
  throw error;
}

// @desc    Get AI-powered skill match recommendations
// @route   POST /api/ai/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.skillsToLearn || currentUser.skillsToLearn.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add skills you want to learn first'
      });
    }

    // Get all other users
    const allUsers = await User.find({ _id: { $ne: req.user.id } })
      .select('name email college skillsToTeach skillsToLearn');

    if (allUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No other users found'
      });
    }

    // Find users who can teach what current user wants to learn
    const potentialMatches = allUsers.filter(user => 
      user.skillsToTeach && user.skillsToTeach.length > 0 &&
      user.skillsToTeach.some(skill => 
        currentUser.skillsToLearn.some(learnSkill => 
          skill.skill.toLowerCase().includes(learnSkill.toLowerCase()) ||
          learnSkill.toLowerCase().includes(skill.skill.toLowerCase())
        )
      )
    );

    if (potentialMatches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No matching users found. Try adding more skills!'
      });
    }

    // Prepare data for Gemini
    const userSkillsToTeach = currentUser.skillsToTeach.map(s => s.skill).join(', ');
    const userSkillsToLearn = currentUser.skillsToLearn.join(', ');

    const matchesData = potentialMatches.slice(0, 5).map(user => ({
      name: user.name,
      teaches: user.skillsToTeach.map(s => s.skill).join(', '),
      wantsToLearn: user.skillsToLearn.join(', ')
    }));

    // Gemini prompt
    const prompt = `You are a skill-matching assistant for a peer-to-peer learning platform.

Current User Profile:
- Can teach: ${userSkillsToTeach || 'Nothing yet'}
- Wants to learn: ${userSkillsToLearn}

Here are potential matches:
${matchesData.map((m, i) => `${i + 1}. ${m.name} - Teaches: ${m.teaches}, Wants to learn: ${m.wantsToLearn}`).join('\n')}

Rank these users from best to worst match for the current user. Consider:
1. How well their teaching skills match what the user wants to learn
2. Mutual benefit (if the user can teach what they want to learn)
3. Skill level compatibility
Respond in JSON format:
{
  "recommendations": [
    {
      "name": "User Name",
      "score": 95,
      "reason": "Brief explanation why this is a good match"
    }
  ]
}`;
    // 🔹 Call Gemini API
    try {
      // Add safety check
      if (!model) {
        throw new Error('Gemini model not initialized');
      }

      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error('Invalid response from Gemini API');
      }
      const textResponse = result.response.text();
      let aiResponse;
      try {
        aiResponse = JSON.parse(textResponse);
      } catch (parseError) {
        console.warn("Gemini did not return valid JSON, using fallback");
        aiResponse = {
          recommendations: matchesData.map((m, i) => ({
            name: m.name,
            score: 90 - (i * 10),
            reason: `Can teach ${m.teaches} which matches your learning goals`
          }))
        };
      }

      // Merge AI recommendations with full user data
      const recommendations = aiResponse.recommendations.map(rec => {
        const fullUser = potentialMatches.find(u => u.name === rec.name);
        return {
          ...rec,
          user: fullUser
        };
      }).filter(rec => rec.user); // Remove invalid ones
      res.status(200).json({
        success: true,
        recommendations
      });
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback to simple recommendations
      return await exports.getSimpleRecommendations(req, res);
    }

  } catch (error) {
    console.error('AI Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate recommendations',
      error: error.message
    });
  }
};
// @desc    Get simple recommendations without AI (fallback)
// @route   GET /api/ai/simple-recommendations
// @access  Private
exports.getSimpleRecommendations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.skillsToLearn || currentUser.skillsToLearn.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add skills you want to learn first'
      });
    }

    // Find users who can teach what current user wants to learn
    const recommendations = await User.find({
      _id: { $ne: req.user.id },
      'skillsToTeach.skill': { 
        $in: currentUser.skillsToLearn.map(skill => new RegExp(skill, 'i'))
      }
    })
    .select('name email college avatar skillsToTeach skillsToLearn')
    .limit(5);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.map((user, index) => ({
        score: 90 - (index * 10),
        reason: 'Teaches skills you want to learn',
        user
      }))
    });

  } catch (error) {
    console.error('Simple Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};
