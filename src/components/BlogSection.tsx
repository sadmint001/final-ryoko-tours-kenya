import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, Search, Clock, Heart, Share2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const BlogSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const blogPosts = [
    {
      id: 1,
      title: "The Great Migration: Nature's Most Spectacular Show",
      excerpt: "Witness millions of wildebeest and zebras cross the Mara River in one of the world's most incredible wildlife spectacles. Learn the best viewpoints and timing for this once-in-a-lifetime experience.",
      coverImage: "/lovable-uploads/8830a94e-8109-4438-99fc-7b8392c0c9c5.png",
      author: "Dr. Sarah Kimani",
      publishedAt: "2024-02-15",
      category: "Wildlife",
      readTime: "12 min read",
      views: 2840,
      featured: true,
      tags: ["Migration", "Masai Mara", "Wildlife"]
    },
    {
      id: 2,
      title: "Photography Mastery: Capturing the Big Five",
      excerpt: "Professional techniques for photographing lions, elephants, rhinos, leopards, and buffalo. From camera settings to ethical wildlife photography practices.",
      coverImage: "/lovable-uploads/73327ee8-9c0a-46bc-bb2d-790af95674a4.png",
      author: "Marcus Andersson",
      publishedAt: "2024-02-10",
      category: "Photography",
      readTime: "15 min read",
      views: 1920,
      featured: true,
      tags: ["Big Five", "Photography", "Equipment"]
    },
    {
      id: 3,
      title: "Maasai Culture: Ancient Traditions in Modern Kenya",
      excerpt: "Explore the rich heritage of the Maasai people, their traditional ceremonies, vibrant beadwork, and how they coexist with wildlife in the modern world.",
      coverImage: "/lovable-uploads/0495d7fd-3442-44b2-a254-6666dcde17d0.png",
      author: "Grace Wanjiku",
      publishedAt: "2024-02-08",
      category: "Culture",
      readTime: "10 min read",
      views: 1650,
      featured: false,
      tags: ["Maasai", "Culture", "Traditions"]
    },
    {
      id: 4,
      title: "Best Safari Lodges: Luxury Meets Wilderness",
      excerpt: "Discover Kenya's most luxurious safari lodges where comfort meets conservation. From treetop suites to infinity pools overlooking the savanna.",
      coverImage: "/lovable-uploads/67714bb6-efb7-46fc-9d50-40094c91c610.png",
      author: "James Mitchell",
      publishedAt: "2024-02-05",
      category: "Accommodation",
      readTime: "8 min read",
      views: 2100,
      featured: false,
      tags: ["Luxury", "Lodges", "Accommodation"]
    },
    {
      id: 5,
      title: "Conservation Success: Kenya's Rhino Recovery Story",
      excerpt: "How dedicated conservation efforts have brought Kenya's rhino population back from the brink of extinction. Meet the heroes behind this remarkable recovery.",
      coverImage: "/lovable-uploads/1dd617ea-b3b5-491f-a2f7-ef1c4170e0d6.png",
      author: "Dr. Mary Kariuki",
      publishedAt: "2024-02-01",
      category: "Conservation",
      readTime: "11 min read",
      views: 980,
      featured: false,
      tags: ["Rhino", "Conservation", "Success Story"]
    },
    {
      id: 6,
      title: "Culinary Safari: Taste of Kenya's Wild Flavors",
      excerpt: "From traditional Nyama Choma to bush breakfast with elephants nearby. Discover the unique culinary experiences that make a Kenyan safari unforgettable.",
      coverImage: "/lovable-uploads/24bcc57e-638a-4459-838a-5f795ba7d56c.png",
      author: "Chef Anthony Mbugua",
      publishedAt: "2024-01-28",
      category: "Food & Culture",
      readTime: "7 min read",
      views: 1430,
      featured: false,
      tags: ["Food", "Culture", "Experience"]
    },
    {
      id: 7,
      title: "Night Safari Adventures: When Darkness Comes Alive",
      excerpt: "Experience the African wilderness after dark. Learn about nocturnal animals, night game drives, and the magical sounds of the African night.",
      coverImage: "/lovable-uploads/69adab17-1c5d-40e0-af0c-031e44b5af13.png",
      author: "Samuel Rotich",
      publishedAt: "2024-01-25",
      category: "Adventure",
      readTime: "9 min read",
      views: 1770,
      featured: false,
      tags: ["Night Safari", "Adventure", "Nocturnal"]
    },
    {
      id: 8,
      title: "Family Safari Guide: Creating Memories with Kids",
      excerpt: "Tips for planning the perfect family safari adventure. Age-appropriate activities, safety considerations, and how to keep young explorers engaged.",
      coverImage: "/lovable-uploads/82758729-70b4-4fcb-87b2-3d2ac3f97ca0.png",
      author: "Linda Ochieng",
      publishedAt: "2024-01-22",
      category: "Family Travel",
      readTime: "13 min read",
      views: 2250,
      featured: false,
      tags: ["Family", "Kids", "Safety"]
    },
    {
      id: 9,
      title: "Birds of Kenya: A Paradise for Ornithologists",
      excerpt: "With over 1,100 bird species, Kenya is a birder's dream. Discover the best locations, seasonal migration patterns, and endemic species to look out for.",
      coverImage: "/lovable-uploads/a6a63721-ea3e-40bd-8d4b-4a7b7d495954.png",
      author: "Dr. Peter Njoroge",
      publishedAt: "2024-01-20",
      category: "Wildlife",
      readTime: "14 min read",
      views: 890,
      featured: false,
      tags: ["Birds", "Ornithology", "Species"]
    }
  ];

  const categories = ['All', 'Wildlife', 'Photography', 'Culture', 'Conservation', 'Adventure', 'Family Travel', 'Food & Culture', 'Accommodation'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Safari Stories & Travel Tips
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get inspired and informed with our latest articles about wildlife, culture, and adventure in Kenya
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search articles, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && selectedCategory === 'All' && searchTerm === '' && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Featured Stories</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img 
                      src={post.coverImage} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                      Featured
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl lg:text-2xl group-hover:text-primary transition-colors duration-200 leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 text-primary" />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="mb-12">
          {(selectedCategory !== 'All' || searchTerm !== '') && (
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'} Found
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </h3>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-elegant transition-all duration-300 overflow-hidden animate-fade-in">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200 leading-tight">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs">{post.views}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No articles found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link to="/blog">
            <Button size="lg" className="px-8">
              View All Articles
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;